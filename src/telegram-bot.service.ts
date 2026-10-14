import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { districtsByRegionId, getDistrictLabel, regions } from './regions.js';
import { sixthGradeSurvey, surveyLabels } from './sixth-grade-survey.js';
import { seventhGradeSurvey } from './seventh-grade-survey.js';
import { eighthGradeSurvey } from './eighth-grade-survey.js';
import { ninthGradeSurvey } from './ninth-grade-survey.js';
import { createExcelWorkbook } from './excel-export.js';

type Language = 'uz' | 'ru';
type Step =
  | 'name'
  | 'gender'
  | 'region'
  | 'district'
  | 'age'
  | 'grade'
  | 'survey-grade'
  | 'survey';

interface StudentProfile {
  language: Language;
  name?: string;
  gender?: string;
  regionId?: number;
  district?: string;
  age?: number;
}

interface Registration extends StudentProfile {
  step: Step;
  grade?: number;
  surveyQuestion?: number;
  surveyAwaitingOther?: boolean;
  surveyAwaitingFollowUp?: boolean;
  surveySelections?: string[];
  surveyAnswers?: Record<number, string[]>;
}

interface CompletedSurvey {
  submittedAt: string;
  profile: StudentProfile;
  grade: number;
  answers: Record<number, string[]>;
}

interface TelegramUpdate {
  update_id: number;
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { chat: { id: number } };
  };
  message?: {
    chat: { id: number };
    from?: { id: number };
    text?: string;
  };
}

interface TelegramChatMember {
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
  is_member?: boolean;
}

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
}

const CHANNEL_USERNAME = '@kelajakmarkazlariuz';
const CHANNEL_URL = 'https://t.me/kelajakmarkazlariuz';

const text = {
  uz: {
    welcome: 'Assalomu alaykum! Xush kelibsiz.\nTilni tanlang:',
    name: 'Familiya ismingizni kiriting:',
    gender: 'Jinsingizni tanlang:',
    male: "O'g'il",
    female: 'Qiz',
    region: 'Viloyatingizni tanlang:',
    district: 'Tumaningizni tanlang:',
    age: 'Yoshingizni kiriting:',
    grade: 'Sinfingizni tanlang:',
    invalidName: 'Familiya va ismingizni kiriting (2–100 belgi):',
    invalidChoice: 'Iltimos, tugmalardan birini tanlang.',
    invalidAge: 'Yoshingizni 1 dan 120 gacha bo‘lgan butun son bilan kiriting:',
    complete: 'Ro‘yxatdan o‘tish yakunlandi!',
    survey: 'So‘rovnoma:',
    summary: (r: Registration, region: string, grade: string) =>
      `Ism-familiya: ${r.name}\nJinsi: ${r.gender}\nViloyat: ${region}\nTuman: ${r.district}\nYoshi: ${r.age}\nSinf: ${grade}`,
  },
  ru: {
    welcome: 'Здравствуйте! Добро пожаловать.\nВыберите язык:',
    name: 'Введите фамилию и имя:',
    gender: 'Выберите пол:',
    male: 'Мальчик',
    female: 'Девочка',
    region: 'Выберите область или город:',
    district: 'Выберите район:',
    age: 'Введите ваш возраст:',
    grade: 'Выберите класс:',
    invalidName: 'Введите фамилию и имя (от 2 до 100 символов):',
    invalidChoice: 'Пожалуйста, выберите один из вариантов на кнопках.',
    invalidAge: 'Введите возраст целым числом от 1 до 120:',
    complete: 'Регистрация завершена!',
    survey: 'Опрос:',
    summary: (r: Registration, region: string, grade: string) =>
      `Фамилия и имя: ${r.name}\nПол: ${r.gender}\nОбласть: ${region}\nРайон: ${r.district}\nВозраст: ${r.age}\nКласс: ${grade}`,
  },
} as const;

type BotRole = 'student' | 'admin';

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly registrations = new Map<string, Registration>();
  private readonly profiles = new Map<string, StudentProfile>();
  private readonly completedSurveys = new Map<number, CompletedSurvey[]>();
  private readonly verifiedSubscribers = new Set<string>();
  private readonly adminAwaitingGrade = new Set<number>();
  private readonly adminChatIds = new Set(
    (process.env.ADMIN_CHAT_IDS ?? '749309408,5531717864')
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isSafeInteger(id) && id > 0),
  );
  private readonly studentToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly adminToken = process.env.ADMIN_BOT_TOKEN;
  private readonly responsesFile = resolve(
    process.env.SURVEY_RESPONSES_FILE ?? 'data/survey-responses.json',
  );
  private running = false;

  async onModuleInit(): Promise<void> {
    await this.loadSurveyResponses();
    if (!this.studentToken) {
      this.logger.error('TELEGRAM_BOT_TOKEN is not configured; Telegram polling is disabled.');
    } else {
      this.running = true;
      void this.poll(this.studentToken, 'student');
    }
    if (this.adminToken && this.adminToken !== this.studentToken) {
      this.running = true;
      void this.poll(this.adminToken, 'admin');
    } else if (!this.adminToken) {
      this.logger.error('ADMIN_BOT_TOKEN is not configured; admin bot polling is disabled.');
    }
  }

  onModuleDestroy(): void {
    this.running = false;
  }

  private async poll(token: string, role: BotRole): Promise<void> {
    let offset = 0;
    while (this.running) {
      try {
        const updates = await this.api<TelegramUpdate[]>('getUpdates', {
          offset,
          timeout: 25,
        }, token);
        for (const update of updates) {
          await this.processUpdate(update, role, token);
          offset = update.update_id + 1;
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        this.logger.error(`${role} Telegram polling failed: ${detail}. Retrying in 3 seconds.`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  private async processUpdate(
    update: TelegramUpdate,
    role: BotRole = 'student',
    token = this.studentToken,
  ): Promise<void> {
    if (update.callback_query) {
      await this.processSubscriptionCallback(update.callback_query, role, token);
      return;
    }

    const message = update.message;
    const userId = message?.from?.id;
    const chatId = message?.chat.id;
    const input = message?.text?.trim();
    if (!userId || !chatId || !input) return;

    const sessionKey = `${chatId}:${userId}`;
    const activeToken = token ?? this.studentToken;
    const isAdmin = this.adminChatIds.has(chatId) || this.adminChatIds.has(userId);
    if (role === 'admin') {
      if (!activeToken) {
        throw new Error('ADMIN_BOT_TOKEN is required to process admin bot updates.');
      }
      if (!isAdmin) {
        if (/^\/start(?:@\w+)?(?:\s|$)/i.test(input)) {
          await this.sendMessage(chatId, 'Admin ruxsati mavjud emas.', undefined, activeToken);
        }
        return;
      }
      await this.processAdminInput(chatId, input, activeToken);
      return;
    }
    if (isAdmin && this.adminAwaitingGrade.has(chatId)) {
      if (!activeToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is required to process student bot updates.');
      }
      await this.processAdminInput(chatId, input, activeToken);
      return;
    }

    if (!isAdmin && !this.verifiedSubscribers.has(sessionKey)) {
      if (!activeToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is required to check channel membership.');
      }
      if (!(await this.isChannelMember(userId, activeToken))) {
        await this.sendSubscriptionPrompt(chatId, activeToken);
        return;
      }
      this.verifiedSubscribers.add(sessionKey);
    }

    if (/^\/start(?:@\w+)?(?:\s|$)/i.test(input)) {
      if (isAdmin) {
        this.registrations.delete(sessionKey);
        if (!activeToken) {
          throw new Error('TELEGRAM_BOT_TOKEN is required to process student bot updates.');
        }
        await this.showAdminGradePicker(chatId, activeToken);
        return;
      }
      this.registrations.delete(sessionKey);
      const profile = this.profiles.get(sessionKey);
      if (profile) {
        this.registrations.set(sessionKey, {
          ...profile,
          step: 'survey-grade',
          surveyAnswers: {},
          surveySelections: [],
        });
        await this.sendMessage(chatId, text[profile.language].grade, {
          keyboard: this.gradeKeyboard(profile.language),
          resize_keyboard: true,
          one_time_keyboard: true,
        });
        return;
      }
      await this.sendMessage(chatId, text.uz.welcome, {
        keyboard: [[{ text: 'O‘zbek tili' }, { text: 'Русский язык' }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      });
      return;
    }

    if (input === 'O‘zbek tili' || input === "O'zbek tili") {
      this.registrations.set(sessionKey, { language: 'uz', step: 'name' });
      await this.sendMessage(chatId, text.uz.name, { remove_keyboard: true });
      return;
    }
    if (input === 'Русский язык') {
      this.registrations.set(sessionKey, { language: 'ru', step: 'name' });
      await this.sendMessage(chatId, text.ru.name, { remove_keyboard: true });
      return;
    }

    const registration = this.registrations.get(sessionKey);
    if (!registration) return;
    const prompts = text[registration.language];

    switch (registration.step) {
      case 'name':
        if (input.split(/\s+/).length < 2 || input.length > 100) {
          await this.sendMessage(chatId, prompts.invalidName);
          return;
        }
        registration.name = input;
        registration.step = 'gender';
        await this.sendMessage(chatId, prompts.gender, {
          keyboard: [[{ text: prompts.male }, { text: prompts.female }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        });
        return;
      case 'gender':
        if (input !== prompts.male && input !== prompts.female) {
          await this.sendMessage(chatId, prompts.invalidChoice);
          return;
        }
        registration.gender = input;
        registration.step = 'region';
        await this.sendMessage(chatId, prompts.region, {
          keyboard: this.rows(regions.map((region) => ({
            text: registration.language === 'uz' ? region.nameUz : region.nameRu,
          }))),
          resize_keyboard: true,
          one_time_keyboard: true,
        });
        return;
      case 'region': {
        const region = regions.find((item) =>
          input === (registration.language === 'uz' ? item.nameUz : item.nameRu),
        );
        if (!region) {
          await this.sendMessage(chatId, prompts.invalidChoice);
          return;
        }
        registration.regionId = region.id;
        registration.step = 'district';
        await this.sendMessage(chatId, prompts.district, {
          keyboard: this.rows(
            districtsByRegionId[region.id].map((district) => ({
              text: getDistrictLabel(district, registration.language),
            })),
          ),
          resize_keyboard: true,
          one_time_keyboard: true,
        });
        return;
      }
      case 'district': {
        const district = districtsByRegionId[registration.regionId!].find(
          (item) => input === getDistrictLabel(item, registration.language),
        );
        if (!district) {
          await this.sendMessage(chatId, prompts.invalidChoice);
          return;
        }
        registration.district = getDistrictLabel(district, registration.language);
        registration.step = 'age';
        await this.sendMessage(chatId, prompts.age, { remove_keyboard: true });
        return;
      }
      case 'age': {
        const age = Number(input);
        if (!/^\d+$/.test(input) || age < 1 || age > 120) {
          await this.sendMessage(chatId, prompts.invalidAge);
          return;
        }
        registration.age = age;
        registration.step = 'grade';
        await this.sendMessage(chatId, prompts.grade, {
          keyboard: this.gradeKeyboard(registration.language),
          resize_keyboard: true,
          one_time_keyboard: true,
        });
        return;
      }
      case 'survey-grade': {
        const selectedGrade = this.gradeNumber(input, registration.language);
        if (!selectedGrade) {
          await this.sendMessage(chatId, prompts.invalidChoice);
          return;
        }
        registration.grade = selectedGrade;
        registration.step = 'survey';
        registration.surveyQuestion = 0;
        registration.surveyAnswers = {};
        registration.surveySelections = [];
        await this.sendMessage(chatId, this.surveyTitle(registration), {
          remove_keyboard: true,
        });
        await this.sendSurveyQuestion(chatId, registration);
        return;
      }
      case 'grade': {
        const selectedGrade = this.gradeNumber(input, registration.language);
        if (!selectedGrade) {
          await this.sendMessage(chatId, prompts.invalidChoice);
          return;
        }
        const region = regions.find((item) => item.id === registration.regionId)!;
        registration.grade = selectedGrade;
        this.profiles.set(sessionKey, {
          language: registration.language,
          name: registration.name,
          gender: registration.gender,
          regionId: registration.regionId,
          district: registration.district,
          age: registration.age,
        });
        if (
          registration.grade === 6 ||
          registration.grade === 7 ||
          registration.grade === 8 ||
          registration.grade === 9
        ) {
          registration.step = 'survey';
          registration.surveyQuestion = 0;
          registration.surveyAnswers = {};
          registration.surveySelections = [];
          await this.sendMessage(
            chatId,
            `${prompts.complete}\n\n${prompts.summary(
              registration,
              registration.language === 'uz' ? region.nameUz : region.nameRu,
              input,
            )}\n\n${this.surveyTitle(registration)}`,
            { remove_keyboard: true },
          );
          await this.sendSurveyQuestion(chatId, registration);
          return;
        }
        await this.sendMessage(
          chatId,
          `${prompts.complete}\n\n${prompts.summary(
            registration,
            registration.language === 'uz' ? region.nameUz : region.nameRu,
            input,
          )}`,
          { remove_keyboard: true },
        );
        this.registrations.delete(sessionKey);
        return;
      }
      case 'survey':
        await this.processSurveyAnswer(chatId, sessionKey, registration, input);
    }
  }

  private async processSubscriptionCallback(
    callback: NonNullable<TelegramUpdate['callback_query']>,
    role: BotRole,
    token?: string,
  ): Promise<void> {
    if (role !== 'student' || callback.data !== 'check_channel_subscription') return;
    const chatId = callback.message?.chat.id ?? callback.from.id;
    const activeToken = token ?? this.studentToken;
    if (!activeToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is required to check channel membership.');
    }

    const sessionKey = `${chatId}:${callback.from.id}`;
    const isMember = await this.isChannelMember(callback.from.id, activeToken);
    await this.api('answerCallbackQuery', {
      callback_query_id: callback.id,
      ...(isMember ? {} : { text: 'Avval kanalga obuna bo‘ling.' }),
    }, activeToken);
    if (!isMember) {
      await this.sendSubscriptionPrompt(chatId, activeToken);
      return;
    }

    this.verifiedSubscribers.add(sessionKey);
    await this.sendMessage(chatId, text.uz.welcome, {
      keyboard: [[{ text: 'O‘zbek tili' }, { text: 'Русский язык' }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    }, activeToken);
  }

  private async isChannelMember(userId: number, token: string): Promise<boolean> {
    let member: TelegramChatMember;
    try {
      member = await this.api<TelegramChatMember>('getChatMember', {
        chat_id: CHANNEL_USERNAME,
        user_id: userId,
      }, token);
    } catch (error) {
      if (
        error instanceof Error &&
        /Telegram API getChatMember returned HTTP 400: Bad Request: member not found\.?$/.test(
          error.message,
        )
      ) {
        return false;
      }
      throw error;
    }
    return (
      member.status === 'creator' ||
      member.status === 'administrator' ||
      member.status === 'member' ||
      (member.status === 'restricted' && member.is_member === true)
    );
  }

  private async sendSubscriptionPrompt(chatId: number, token: string): Promise<void> {
    await this.sendMessage(chatId, 'Botdan foydalanish uchun avval kanalga obuna bo‘ling:', {
      inline_keyboard: [
        [{ text: '📢 Kanalga obuna bo‘lish', url: CHANNEL_URL }],
        [{ text: '✅ Obunani tekshirish', callback_data: 'check_channel_subscription' }],
      ],
    }, token);
  }

  private async processAdminInput(
    chatId: number,
    input: string,
    token: string,
  ): Promise<void> {
    if (/^\/start(?:@\w+)?(?:\s|$)/i.test(input)) {
      await this.showAdminGradePicker(chatId, token);
      return;
    }
    if (!this.adminAwaitingGrade.has(chatId)) return;

    const grade = this.gradeNumber(input, 'uz');
    if (!grade) {
      await this.sendMessage(chatId, 'Iltimos, 6-sinf, 7-sinf, 8-sinf yoki 9-sinfni tanlang.', undefined, token);
      return;
    }
    this.adminAwaitingGrade.delete(chatId);
    await this.sendSurveyExport(chatId, grade, token);
  }

  private async showAdminGradePicker(chatId: number, token: string): Promise<void> {
    this.adminAwaitingGrade.add(chatId);
    await this.sendMessage(chatId, 'Excel faylini olish uchun sinfni tanlang:', {
      keyboard: this.gradeKeyboard('uz'),
      resize_keyboard: true,
      one_time_keyboard: true,
    }, token);
  }

  private async processSurveyAnswer(
    chatId: number,
    sessionKey: string,
    registration: Registration,
    input: string,
  ): Promise<void> {
    const language = registration.language;
    const labels = surveyLabels[language];
    const questionIndex = registration.surveyQuestion!;
    const survey = this.getSurvey(registration);
    const question = survey[questionIndex];
    const answers = registration.surveyAnswers!;

    if (registration.surveyAwaitingOther) {
      answers[questionIndex] = [...registration.surveySelections!];
      answers[questionIndex].push(`${language === 'uz' ? 'Boshqa' : 'Другое'}: ${input}`);
      registration.surveyAwaitingOther = false;
      await this.sendSurveyQuestion(chatId, registration);
      return;
    }

    if (registration.surveyAwaitingFollowUp) {
      answers[questionIndex].push(input);
      registration.surveyAwaitingFollowUp = false;
      await this.nextSurveyQuestion(chatId, sessionKey, registration);
      return;
    }

    if (question.type === 'multi') {
      if (input === labels.done) {
        if (registration.surveySelections!.length === 0) {
          await this.sendMessage(chatId, labels.empty);
          return;
        }
        answers[questionIndex] = [...registration.surveySelections!];
        await this.nextSurveyQuestion(chatId, sessionKey, registration);
        return;
      }
      const selectedOption = input.startsWith('✓ ') ? input.slice(2) : input;
      if (!question.options!.includes(selectedOption)) {
        await this.sendMessage(chatId, labels.invalidChoice);
        return;
      }
      if (selectedOption === question.options!.at(-1) &&
        (selectedOption === 'Boshqa' || selectedOption === 'Другое')) {
        registration.surveySelections!.push(selectedOption);
        registration.surveyAwaitingOther = true;
        await this.sendMessage(chatId, labels.enterOther, { remove_keyboard: true });
        return;
      }

      const selections = registration.surveySelections!;
      const selectionIndex = selections.indexOf(selectedOption);
      if (selectionIndex === -1) selections.push(selectedOption);
      else selections.splice(selectionIndex, 1);
      await this.sendSurveyQuestion(chatId, registration);
      return;
    }

    if (question.type === 'choice') {
      if (!question.options!.includes(input)) {
        await this.sendMessage(chatId, labels.invalidChoice);
        return;
      }
      answers[questionIndex] = [input];
      if (input === question.followUpWhen) {
        registration.surveyAwaitingFollowUp = true;
        await this.sendMessage(chatId, question.followUpPrompt!, {
          remove_keyboard: true,
        });
        return;
      }
      await this.nextSurveyQuestion(chatId, sessionKey, registration);
      return;
    }

    if (!input) {
      await this.sendMessage(chatId, question.prompt);
      return;
    }
    answers[questionIndex] = [input];
    await this.nextSurveyQuestion(chatId, sessionKey, registration);
  }

  private async nextSurveyQuestion(
    chatId: number,
    sessionKey: string,
    registration: Registration,
  ): Promise<void> {
    registration.surveyQuestion = registration.surveyQuestion! + 1;
    registration.surveySelections = [];
    if (registration.surveyQuestion! >= this.getSurvey(registration).length) {
      const grade = registration.grade!;
      const submissions = this.completedSurveys.get(registration.grade!) ?? [];
      submissions.push({
        submittedAt: new Date().toISOString(),
        profile: {
          language: registration.language,
          name: registration.name,
          gender: registration.gender,
          regionId: registration.regionId,
          district: registration.district,
          age: registration.age,
        },
        grade,
        answers: Object.fromEntries(
          Object.entries(registration.surveyAnswers!).map(([index, values]) => [
            index,
            [...values],
          ]),
        ),
      });
      this.completedSurveys.set(grade, submissions);
      await this.persistSurveyResponses();
      await this.sendMessage(
        chatId,
        grade === 6
          ? surveyLabels[registration.language].saved
          : registration.language === 'uz'
            ? `Rahmat! ${grade}-sinf so‘rovnomasi yakunlandi. Javoblaringiz qabul qilindi.`
            : `Спасибо! Опрос для ${grade}-го класса завершён. Ваши ответы приняты.`,
        { remove_keyboard: true },
      );
      this.registrations.delete(sessionKey);
      return;
    }
    await this.sendSurveyQuestion(chatId, registration);
  }

  private async sendSurveyQuestion(
    chatId: number,
    registration: Registration,
  ): Promise<void> {
    const language = registration.language;
    const labels = surveyLabels[language];
    const question = this.getSurvey(registration)[registration.surveyQuestion!];

    if (question.type === 'multi') {
      const selected = registration.surveySelections!;
      const options = question.options!.map((option) => ({
        text: selected.includes(option) ? `✓ ${option}` : option,
      }));
      options.push({ text: labels.done });
      const selectedText = selected.length
        ? `\n\n${labels.selected} ${selected.join(', ')}`
        : '';
      await this.sendMessage(
        chatId,
        `${question.prompt}\n${labels.chooseMultiple}${selectedText}`,
        {
          keyboard: this.rows(options),
          resize_keyboard: true,
          one_time_keyboard: false,
        },
      );
      return;
    }

    if (question.type === 'choice') {
      await this.sendMessage(chatId, question.prompt, {
        keyboard: this.rows(question.options!.map((option) => ({ text: option }))),
        resize_keyboard: true,
        one_time_keyboard: true,
      });
      return;
    }

    await this.sendMessage(chatId, question.prompt, { remove_keyboard: true });
  }

  private getSurvey(registration: Registration) {
    switch (registration.grade) {
      case 7:
        return seventhGradeSurvey[registration.language];
      case 8:
        return eighthGradeSurvey[registration.language];
      case 9:
        return ninthGradeSurvey[registration.language];
      default:
        return sixthGradeSurvey[registration.language];
    }
  }

  private gradeKeyboard(language: Language): Array<Array<{ text: string }>> {
    const grades = language === 'uz'
      ? ['6-sinf', '7-sinf', '8-sinf', '9-sinf']
      : ['6 класс', '7 класс', '8 класс', '9 класс'];
    return this.rows(grades.map((grade) => ({ text: grade })));
  }

  private gradeNumber(input: string, language: Language): number | undefined {
    const grades = language === 'uz'
      ? ['6-sinf', '7-sinf', '8-sinf', '9-sinf']
      : ['6 класс', '7 класс', '8 класс', '9 класс'];
    const gradeIndex = grades.indexOf(input);
    return gradeIndex === -1 ? undefined : gradeIndex + 6;
  }

  private surveyTitle(registration: Registration): string {
    if (registration.grade === 6) {
      return registration.language === 'uz'
        ? 'Kasbga qiziqish savolnomasi:'
        : 'Анкета о профессиональных интересах:';
    }
    if (registration.grade === 7) {
      return registration.language === 'uz'
        ? 'Jamoatchilik faolligi so‘rovnomasi:'
        : 'Опрос об общественной активности:';
    }
    if (registration.grade === 8) {
      return registration.language === 'uz'
        ? 'Qiziqishlar so‘rovnomasi:'
        : 'Опрос об интересах:';
    }
    return registration.language === 'uz'
      ? 'Kasbiy qiziqishlar so‘rovnomasi:'
      : 'Опрос о профессиональных интересах:';
  }

  private async sendSurveyExport(chatId: number, grade: number, token: string): Promise<void> {
    const submissions = this.completedSurveys.get(grade) ?? [];
    if (grade === 6) {
      await this.sendSixthGradeSurveyExport(chatId, submissions, token);
      return;
    }
    if (grade === 7) {
      await this.sendSeventhGradeSurveyExport(chatId, submissions, token);
      return;
    }
    if (grade === 8) {
      await this.sendEighthGradeSurveyExport(chatId, submissions, token);
      return;
    }
    if (grade === 9) {
      await this.sendNinthGradeSurveyExport(chatId, submissions, token);
      return;
    }

    const rows = [[
      'Topshirilgan vaqt',
      'Familiya va ism',
      'Jinsi',
      'Viloyat',
      'Tuman',
      'Yosh',
      'Sinf',
      'Til',
      'Savol №',
      'Savol',
      'Javob',
    ]];

    if (submissions.length === 0) {
      await this.sendMessage(
        chatId,
        `${grade}-sinf uchun hozircha javoblar yo‘q. Savollar Excel shablonida yuborildi.`,
        undefined,
        token,
      );
      for (const language of ['uz', 'ru'] as const) {
        const survey = this.getSurvey({ language, step: 'survey', grade });
        survey.forEach((question, index) => {
          rows.push([
            '',
            '',
            '',
            '',
            '',
            '',
            grade.toString(),
            language === 'uz' ? 'O‘zbekcha' : 'Русский',
            (index + 1).toString(),
            question.prompt,
            '',
          ]);
        });
      }
    }

    for (const submission of submissions) {
      const survey = this.getSurvey({
        ...submission.profile,
        step: 'survey',
        grade,
      });
      const region = regions.find((item) => item.id === submission.profile.regionId);
      for (const [index, question] of survey.entries()) {
        rows.push([
          submission.submittedAt,
          submission.profile.name ?? '',
          submission.profile.gender ?? '',
          region
            ? submission.profile.language === 'uz' ? region.nameUz : region.nameRu
            : '',
          submission.profile.district ?? '',
          submission.profile.age?.toString() ?? '',
          grade.toString(),
          submission.profile.language === 'uz' ? 'O‘zbekcha' : 'Русский',
          (index + 1).toString(),
          question.prompt,
          (submission.answers[index] ?? []).join(', '),
        ]);
      }
    }

    const workbook = createExcelWorkbook(rows, `${grade}-sinf`);
    const filename = `sinf-${grade}-sorovnoma-javoblari.xlsx`;
    await this.sendDocument(chatId, workbook, filename, token);
  }

  private async sendSixthGradeSurveyExport(
    chatId: number,
    submissions: CompletedSurvey[],
    token: string,
  ): Promise<void> {
    if (submissions.length === 0) {
      await this.sendMessage(
        chatId,
        '6-sinf uchun hozircha javoblar yo‘q. Savollar Excel shablonida yuborildi.',
        undefined,
        token,
      );
    }

    const uzQuestions = sixthGradeSurvey.uz;
    const ruQuestions = sixthGradeSurvey.ru;
    const questionHeaders = uzQuestions.map((question, index) =>
      `${question.prompt.replace(/^\d+\.\s*/, '')} / ${ruQuestions[index].prompt.replace(/^\d+\.\s*/, '')}`,
    );
    const rows = [[
      'Topshirilgan vaqt',
      'Familiya va ism',
      'Jinsi',
      'Viloyat',
      'Tuman',
      'Yosh',
      'Sinf',
      'Til',
      ...questionHeaders,
    ]];

    for (const submission of submissions) {
      const region = regions.find((item) => item.id === submission.profile.regionId);
      rows.push([
        submission.submittedAt,
        submission.profile.name ?? '',
        submission.profile.gender ?? '',
        region
          ? submission.profile.language === 'uz' ? region.nameUz : region.nameRu
          : '',
        submission.profile.district ?? '',
        submission.profile.age?.toString() ?? '',
        '6',
        submission.profile.language === 'uz' ? 'O‘zbekcha' : 'Русский',
        ...uzQuestions.map((_, index) => (submission.answers[index] ?? []).join(', ')),
      ]);
    }

    const workbook = createExcelWorkbook(rows, '6-sinf');
    await this.sendDocument(chatId, workbook, 'sinf-6-sorovnoma-javoblari.xlsx', token);
  }

  private async sendSeventhGradeSurveyExport(
    chatId: number,
    submissions: CompletedSurvey[],
    token: string,
  ): Promise<void> {
    if (submissions.length === 0) {
      await this.sendMessage(
        chatId,
        '7-sinf uchun hozircha javoblar yo‘q. Savollar Excel shablonida yuborildi.',
        undefined,
        token,
      );
    }

    const uzQuestions = seventhGradeSurvey.uz;
    const ruQuestions = seventhGradeSurvey.ru;
    const questionHeaders = uzQuestions.map((question, index) =>
      `${question.prompt.replace(/^\d+\.\s*/, '')} / ${ruQuestions[index].prompt.replace(/^\d+\.\s*/, '')}`,
    );
    const rows = [[
      'Topshirilgan vaqt',
      'Familiya va ism',
      'Jinsi',
      'Viloyat',
      'Tuman',
      'Yosh',
      'Sinf',
      'Til',
      ...questionHeaders,
    ]];

    for (const submission of submissions) {
      const region = regions.find((item) => item.id === submission.profile.regionId);
      rows.push([
        submission.submittedAt,
        submission.profile.name ?? '',
        submission.profile.gender ?? '',
        region
          ? submission.profile.language === 'uz' ? region.nameUz : region.nameRu
          : '',
        submission.profile.district ?? '',
        submission.profile.age?.toString() ?? '',
        '7',
        submission.profile.language === 'uz' ? 'O‘zbekcha' : 'Русский',
        ...uzQuestions.map((_, index) => (submission.answers[index] ?? []).join(', ')),
      ]);
    }

    const workbook = createExcelWorkbook(rows, '7-sinf');
    await this.sendDocument(chatId, workbook, 'sinf-7-sorovnoma-javoblari.xlsx', token);
  }

  private async sendEighthGradeSurveyExport(
    chatId: number,
    submissions: CompletedSurvey[],
    token: string,
  ): Promise<void> {
    if (submissions.length === 0) {
      await this.sendMessage(
        chatId,
        '8-sinf uchun hozircha javoblar yo‘q. Savollar Excel shablonida yuborildi.',
        undefined,
        token,
      );
    }

    const uzQuestions = eighthGradeSurvey.uz;
    const ruQuestions = eighthGradeSurvey.ru;
    const questionHeaders = uzQuestions.map((question, index) =>
      `${question.prompt.replace(/^\d+\.\s*/, '')} / ${ruQuestions[index].prompt.replace(/^\d+\.\s*/, '')}`,
    );
    const rows = [[
      'Topshirilgan vaqt',
      'Familiya va ism',
      'Jinsi',
      'Viloyat',
      'Tuman',
      'Yosh',
      'Sinf',
      'Til',
      ...questionHeaders,
    ]];

    for (const submission of submissions) {
      const region = regions.find((item) => item.id === submission.profile.regionId);
      rows.push([
        submission.submittedAt,
        submission.profile.name ?? '',
        submission.profile.gender ?? '',
        region
          ? submission.profile.language === 'uz' ? region.nameUz : region.nameRu
          : '',
        submission.profile.district ?? '',
        submission.profile.age?.toString() ?? '',
        '8',
        submission.profile.language === 'uz' ? 'O‘zbekcha' : 'Русский',
        ...uzQuestions.map((_, index) => (submission.answers[index] ?? []).join(', ')),
      ]);
    }

    const workbook = createExcelWorkbook(rows, '8-sinf');
    await this.sendDocument(chatId, workbook, 'sinf-8-sorovnoma-javoblari.xlsx', token);
  }

  private async sendNinthGradeSurveyExport(
    chatId: number,
    submissions: CompletedSurvey[],
    token: string,
  ): Promise<void> {
    if (submissions.length === 0) {
      await this.sendMessage(
        chatId,
        '9-sinf uchun hozircha javoblar yo‘q. Savollar Excel shablonida yuborildi.',
        undefined,
        token,
      );
    }

    const uzQuestions = ninthGradeSurvey.uz;
    const ruQuestions = ninthGradeSurvey.ru;
    const questionHeaders = uzQuestions.map((question, index) =>
      `${question.prompt.replace(/^\d+\.\s*/, '')} / ${ruQuestions[index].prompt.replace(/^\d+\.\s*/, '')}`,
    );
    const rows = [[
      'Topshirilgan vaqt',
      'Familiya va ism',
      'Jinsi',
      'Viloyat',
      'Tuman',
      'Yosh',
      'Sinf',
      'Til',
      ...questionHeaders,
    ]];

    for (const submission of submissions) {
      const region = regions.find((item) => item.id === submission.profile.regionId);
      rows.push([
        submission.submittedAt,
        submission.profile.name ?? '',
        submission.profile.gender ?? '',
        region
          ? submission.profile.language === 'uz' ? region.nameUz : region.nameRu
          : '',
        submission.profile.district ?? '',
        submission.profile.age?.toString() ?? '',
        '9',
        submission.profile.language === 'uz' ? 'O‘zbekcha' : 'Русский',
        ...uzQuestions.map((_, index) => (submission.answers[index] ?? []).join(', ')),
      ]);
    }

    const workbook = createExcelWorkbook(rows, '9-sinf');
    await this.sendDocument(chatId, workbook, 'sinf-9-sorovnoma-javoblari.xlsx', token);
  }

  private async loadSurveyResponses(): Promise<void> {
    let content: string;
    try {
      content = await readFile(this.responsesFile, 'utf8');
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return;
      }
      throw error;
    }

    const stored: unknown = JSON.parse(content);
    if (!Array.isArray(stored) || !stored.every(this.isCompletedSurvey)) {
      throw new Error(`Survey response store has an invalid format: ${this.responsesFile}`);
    }
    for (const submission of stored) {
      const gradeSubmissions = this.completedSurveys.get(submission.grade) ?? [];
      gradeSubmissions.push(submission);
      this.completedSurveys.set(submission.grade, gradeSubmissions);
    }
    this.logger.log(`Loaded ${stored.length} completed survey responses.`);
  }

  private isCompletedSurvey(value: unknown): value is CompletedSurvey {
    if (!value || typeof value !== 'object') return false;
    const item = value as Record<string, unknown>;
    if (
      typeof item.submittedAt !== 'string' ||
      !Number.isInteger(item.grade) ||
      ![6, 7, 8, 9].includes(item.grade as number) ||
      !item.profile ||
      typeof item.profile !== 'object' ||
      !item.answers ||
      typeof item.answers !== 'object' ||
      Array.isArray(item.answers)
    ) {
      return false;
    }
    const profile = item.profile as Record<string, unknown>;
    const answers = item.answers as Record<string, unknown>;
    return (
      (profile.language === 'uz' || profile.language === 'ru') &&
      Object.values(answers).every(
        (answer) => Array.isArray(answer) && answer.every((value) => typeof value === 'string'),
      )
    );
  }

  private async persistSurveyResponses(): Promise<void> {
    const allSubmissions = [...this.completedSurveys.values()].flat();
    await mkdir(dirname(this.responsesFile), { recursive: true });
    const temporaryFile = `${this.responsesFile}.${process.pid}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(allSubmissions, null, 2), 'utf8');
    await rename(temporaryFile, this.responsesFile);
  }

  private rows<T>(items: T[]): T[][] {
    const rows: T[][] = [];
    for (let index = 0; index < items.length; index += 2) {
      rows.push(items.slice(index, index + 2));
    }
    return rows;
  }

  private async sendMessage(
    chatId: number,
    message: string,
    replyMarkup?: Record<string, unknown>,
    token?: string,
  ): Promise<void> {
    await this.api('sendMessage', {
      chat_id: chatId,
      text: message,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    }, token);
  }

  private async sendDocument(
    chatId: number,
    document: Buffer,
    filename: string,
    token: string,
  ): Promise<void> {
    const form = new FormData();
    form.append('chat_id', chatId.toString());
    form.append(
      'document',
      new Blob([new Uint8Array(document)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      filename,
    );
    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(35_000),
    });
    if (!response.ok) {
      throw new Error(`Telegram API sendDocument returned HTTP ${response.status}.`);
    }
    const result = await response.json() as TelegramResponse<unknown>;
    if (!result.ok) {
      throw new Error('Telegram API sendDocument returned ok=false.');
    }
  }

  private async api<T = unknown>(
    method: string,
    body: object,
    token?: string,
  ): Promise<T> {
    const botToken = token ?? this.studentToken;
    if (!botToken) {
      throw new Error(`Cannot call Telegram API ${method}: bot token is not configured.`);
    }
    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(35_000),
    });
    const result = await response.json() as TelegramResponse<T>;
    if (!response.ok || !result.ok) {
      const errorCode = result.error_code ?? response.status;
      const description = result.description ? `: ${result.description}` : '';
      throw new Error(`Telegram API ${method} returned HTTP ${errorCode}${description}`);
    }
    if (result.result === undefined) {
      throw new Error(`Telegram API ${method} returned no result.`);
    }
    return result.result;
  }
}
