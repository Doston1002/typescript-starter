import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { inflateRawSync } from 'node:zlib';
import { TelegramBotService } from './telegram-bot.service.js';
import { sixthGradeSurvey } from './sixth-grade-survey.js';
import { seventhGradeSurvey } from './seventh-grade-survey.js';
import { eighthGradeSurvey } from './eighth-grade-survey.js';
import { ninthGradeSurvey } from './ninth-grade-survey.js';

function getWorksheetXml(workbook: Buffer): string {
  let offset = 0;
  while (workbook.readUInt32LE(offset) === 0x04034b50) {
    const compressedSize = workbook.readUInt32LE(offset + 18);
    const nameLength = workbook.readUInt16LE(offset + 26);
    const extraLength = workbook.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const name = workbook.toString('utf8', nameStart, nameStart + nameLength);
    const contentStart = nameStart + nameLength + extraLength;
    if (name === 'xl/worksheets/sheet1.xml') {
      return inflateRawSync(
        workbook.subarray(contentStart, contentStart + compressedSize),
      ).toString('utf8');
    }
    offset = contentStart + compressedSize;
  }
  throw new Error('Workbook worksheet entry was not found.');
}

describe('TelegramBotService registration', () => {
  let testDirectory: string;

  beforeEach(async () => {
    testDirectory = await mkdtemp(join(tmpdir(), 'telegram-survey-test-'));
    process.env.SURVEY_RESPONSES_FILE = join(testDirectory, 'responses.json');
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.ADMIN_CHAT_IDS;
    delete process.env.ADMIN_BOT_TOKEN;
    delete process.env.SURVEY_RESPONSES_FILE;
    await rm(testDirectory, { recursive: true, force: true });
  });

  it('requires channel membership and allows registration after the callback confirms it', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    const membershipStatuses = ['left', 'left', 'member'];
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      requests.push({ url, body });
      const result = url.endsWith('/getChatMember')
        ? { status: membershipStatuses.shift() }
        : {};
      return new Response(JSON.stringify({ ok: true, result }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();

    await bot['processUpdate']({
      update_id: 1,
      message: { chat: { id: 15 }, from: { id: 15 }, text: '/start' },
    });

    const subscriptionPrompt = requests.find(({ url }) => url.endsWith('/sendMessage'))!;
    expect(subscriptionPrompt.body.text).toContain('avval kanalga obuna bo‘ling');
    expect(subscriptionPrompt.body.reply_markup).toEqual({
      inline_keyboard: [
        [{ text: '📢 Kanalga obuna bo‘lish', url: 'https://t.me/kelajakmarkazlariuz' }],
        [{ text: '✅ Obunani tekshirish', callback_data: 'check_channel_subscription' }],
      ],
    });
    expect(requests[0].body).toMatchObject({
      chat_id: '@kelajakmarkazlariuz',
      user_id: 15,
    });

    await bot['processUpdate']({
      update_id: 2,
      callback_query: {
        id: 'callback-1',
        from: { id: 15 },
        data: 'check_channel_subscription',
        message: { chat: { id: 15 } },
      },
    });
    expect(requests.filter(({ url }) => url.endsWith('/sendMessage'))).toHaveLength(2);

    await bot['processUpdate']({
      update_id: 3,
      callback_query: {
        id: 'callback-2',
        from: { id: 15 },
        data: 'check_channel_subscription',
        message: { chat: { id: 15 } },
      },
    });
    await bot['processUpdate']({
      update_id: 4,
      message: { chat: { id: 15 }, from: { id: 15 }, text: 'O‘zbek tili' },
    });

    expect(requests.filter(({ url }) => url.endsWith('/getChatMember'))).toHaveLength(3);
    expect(requests.filter(({ url }) => url.endsWith('/sendMessage')).at(-1)?.body.text)
      .toBe('Familiya ismingizni kiriting:');
    expect(requests.some(({ url, body }) =>
      url.endsWith('/answerCallbackQuery') && body.callback_query_id === 'callback-2',
    )).toBe(true);
  });

  it('includes Telegram error details when channel membership cannot be checked', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    vi.stubGlobal('fetch', vi.fn(async () =>
    new Response(JSON.stringify({
      ok: false,
      error_code: 400,
      description: 'Bad Request: chat not found',
    }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    }),
    ));
    const bot = new TelegramBotService();

    await expect(bot['processUpdate']({
    update_id: 1,
    message: { chat: { id: 15 }, from: { id: 15 }, text: '/start' },
    })).rejects.toThrow(
    'Telegram API getChatMember returned HTTP 400: Bad Request: chat not found',
    );
  });

  it('treats Telegram member-not-found as not subscribed instead of retrying the update', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      requests.push({ url, body });
      if (url.endsWith('/getChatMember')) {
        return new Response(JSON.stringify({
          ok: false,
          error_code: 400,
          description: 'Bad Request: member not found.',
        }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true, result: {} }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();

    await expect(bot['processUpdate']({
      update_id: 1,
      message: { chat: { id: 15 }, from: { id: 15 }, text: '/start' },
    })).resolves.toBeUndefined();

    expect(requests.filter(({ url }) => url.endsWith('/getChatMember'))).toHaveLength(1);
    expect(requests.find(({ url }) => url.endsWith('/sendMessage'))?.body.text)
      .toContain('avval kanalga obuna bo‘ling');
  });

  it('completes registration using Russian prompts and choices', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    const sentMessages: Array<Record<string, unknown>> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      if ('text' in body) sentMessages.push(body);
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    let updateId = 0;
    const send = async (input: string) => {
      await bot['processUpdate']({
        update_id: updateId++,
        message: { chat: { id: 1 }, from: { id: 2 }, text: input },
      });
    };

    await send('/start');
    await send('Русский язык');
    await send('Иванов Иван');
    await send('Мальчик');
    await send('Республика Каракалпакстан');
    await send('г. Нукус');
    await send('15');
    await send('7 класс');

    expect(sentMessages[0].text).toContain('Tilni tanlang');
    expect(sentMessages[1].text).toBe('Введите фамилию и имя:');
    expect(sentMessages.at(-1).text).toContain('1. Ваши друзья с вами всегда согласны?');
    expect(sentMessages.at(-1).reply_markup).toMatchObject({
      keyboard: [
        [{ text: 'A) да' }, { text: 'B) иногда' }],
        [{ text: 'C) нет' }],
      ],
    });
    for (let question = 0; question < 20; question++) {
      await send('A) да');
    }
    expect(sentMessages.at(-1).text).toContain('Опрос для 7-го класса завершён');
    expect(sentMessages.at(-1).reply_markup).toEqual({ remove_keyboard: true });

    await send('/start');
    expect(sentMessages.at(-1).text).toBe('Выберите класс:');
    expect(sentMessages.at(-1).reply_markup).toMatchObject({
      keyboard: [[{ text: '6 класс' }, { text: '7 класс' }], [{ text: '8 класс' }, { text: '9 класс' }]],
    });
    await send('6 класс');
    expect(sentMessages.at(-1).text).toContain('1. Какие школьные предметы');
    expect(sentMessages.slice(-3).some((message) =>
      message.text === 'Введите фамилию и имя:',
    )).toBe(false);
  });

  it('starts the Uzbek questionnaire for sixth-grade students and accepts multiple answers', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    const sentMessages: Array<Record<string, unknown>> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      if ('text' in body) sentMessages.push(body);
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    let updateId = 0;
    const send = async (input: string) => {
      await bot['processUpdate']({
        update_id: updateId++,
        message: { chat: { id: 3 }, from: { id: 4 }, text: input },
      });
    };

    await send('/start');
    await send('O‘zbek tili');
    await send('Ali Valiyev');
    await send("O'g'il");
    await send("Qoraqalpog'iston Respublikasi");
    await send('Nukus shahar');
    await send('12');
    await send('6-sinf');
    await send('Matematika');
    await send('Ona tili va adabiyot');
    await send('✅ Tanladim');

    expect(sixthGradeSurvey.uz).toHaveLength(15);
    expect(sixthGradeSurvey.ru).toHaveLength(15);
    expect(sentMessages[9].text).toContain('1. Maktabda qaysi fanlarni');
    expect(sentMessages[10].text).toContain('Matematika, Ona tili va adabiyot');
    expect(sentMessages[11].text).toContain('2. Bo‘sh vaqtingizda');
  });

  it('accepts comma-separated career answers in Uzbek and Russian', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    const sentMessages: Array<Record<string, unknown>> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      if ('text' in body) sentMessages.push(body);
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    const cases = [
      {
        language: 'uz' as const,
        answer: 'Dasturchi, shifokor, muhandis',
        nextPrompt: '7. Bu kasbga qiziqishingizga nima sabab bo‘lgan?',
      },
      {
        language: 'ru' as const,
        answer: 'Программист, врач, инженер',
        nextPrompt: '7. Что стало причиной вашего интереса к этой профессии?',
      },
    ];

    for (const [index, testCase] of cases.entries()) {
      await bot['processSurveyAnswer'](
        index + 1,
        `chat:${index}`,
        {
          language: testCase.language,
          step: 'survey',
          surveyQuestion: 5,
          surveyAnswers: {},
          surveySelections: [],
        },
        testCase.answer,
      );
      expect(sixthGradeSurvey[testCase.language][5].prompt).toContain(
        testCase.language === 'uz' ? 'vergul bilan' : 'через запятую',
      );
      expect(sentMessages.at(-1).text).toContain(testCase.nextPrompt);
    }
  });

  it('runs all 20 seventh-grade questions in both languages', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    const sentMessages: Array<Record<string, unknown>> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      if ('text' in body) sentMessages.push(body);
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    const cases = [
      { language: 'uz' as const, answer: 'A) ha', final: '7-sinf so‘rovnomasi yakunlandi' },
      { language: 'ru' as const, answer: 'A) да', final: 'Опрос для 7-го класса завершён' },
    ];

    expect(seventhGradeSurvey.uz).toHaveLength(20);
    expect(seventhGradeSurvey.ru).toHaveLength(20);
    expect(seventhGradeSurvey.uz[0].options).toEqual(['A) ha', 'B) ba’zan', 'C) yo‘q']);
    expect(seventhGradeSurvey.ru[0].options).toEqual(['A) да', 'B) иногда', 'C) нет']);

    for (const [index, testCase] of cases.entries()) {
      const registration = {
        language: testCase.language,
        step: 'survey' as const,
        grade: 7,
        surveyQuestion: 0,
        surveyAnswers: {},
        surveySelections: [],
      };
      for (let question = 0; question < 20; question++) {
        await bot['processSurveyAnswer'](
          index + 1,
          `seventh-grade:${index}`,
          registration,
          testCase.answer,
        );
      }
      expect(sentMessages.at(-1).text).toContain(testCase.final);
      expect(registration.surveyAnswers).toHaveProperty('19');
    }
  });

  it('runs all 45 eighth-grade questions in both languages with yes/no answers', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    const sentMessages: Array<Record<string, unknown>> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      if ('text' in body) sentMessages.push(body);
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    const cases = [
      { language: 'uz' as const, answer: 'Ha', final: '8-sinf so‘rovnomasi yakunlandi' },
      { language: 'ru' as const, answer: 'Да', final: '8-го класса завершён' },
    ];

    expect(eighthGradeSurvey.uz).toHaveLength(45);
    expect(eighthGradeSurvey.ru).toHaveLength(45);
    expect(eighthGradeSurvey.uz[0].options).toEqual(['Ha', 'Yo‘q']);
    expect(eighthGradeSurvey.ru[0].options).toEqual(['Да', 'Нет']);
    expect(eighthGradeSurvey.uz[9].prompt).toContain('Sizga hozir yoqadi');
    expect(eighthGradeSurvey.ru[36].prompt).toContain('Вас долго привлекает');

    for (const [index, testCase] of cases.entries()) {
      const registration = {
        language: testCase.language,
        step: 'survey' as const,
        grade: 8,
        surveyQuestion: 0,
        surveyAnswers: {},
        surveySelections: [],
      };
      for (let question = 0; question < 45; question++) {
        await bot['processSurveyAnswer'](
          index + 1,
          `eighth-grade:${index}`,
          registration,
          testCase.answer,
        );
      }
      expect(sentMessages.at(-1).text).toContain(testCase.final);
      expect(registration.surveyAnswers).toHaveProperty('44');
    }
  });

  it('runs all 50 ninth-grade questions in both languages with yes/no answers', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    const sentMessages: Array<Record<string, unknown>> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as Record<string, unknown>;
      if ('text' in body) sentMessages.push(body);
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    const cases = [
      { language: 'uz' as const, answer: 'Ha', final: '9-sinf so‘rovnomasi yakunlandi' },
      { language: 'ru' as const, answer: 'Да', final: '9-го класса завершён' },
    ];

    expect(ninthGradeSurvey.uz).toHaveLength(50);
    expect(ninthGradeSurvey.ru).toHaveLength(50);
    expect(ninthGradeSurvey.uz[0].options).toEqual(['Ha', 'Yo‘q']);
    expect(ninthGradeSurvey.ru[0].options).toEqual(['Да', 'Нет']);
    expect(ninthGradeSurvey.uz[49].prompt).toContain('Sport musobaqalarida');
    expect(ninthGradeSurvey.ru[49].prompt).toContain('спортивных соревнованиях');

    for (const [index, testCase] of cases.entries()) {
      const registration = {
        language: testCase.language,
        step: 'survey' as const,
        grade: 9,
        surveyQuestion: 0,
        surveyAnswers: {},
        surveySelections: [],
      };
      for (let question = 0; question < 50; question++) {
        await bot['processSurveyAnswer'](
          index + 1,
          `ninth-grade:${index}`,
          registration,
          testCase.answer,
        );
      }
      expect(sentMessages.at(-1).text).toContain(testCase.final);
      expect(registration.surveyAnswers).toHaveProperty('49');
    }
  });

  it('lets the configured admin download a selected grade survey as an Excel file', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.ADMIN_BOT_TOKEN = 'admin-test-token';
    process.env.ADMIN_CHAT_IDS = '749309408,5531717864';
    const requests: Array<{ url: string; options: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    let updateId = 0;
    const send = async (chatId: number, input: string) => {
      await bot['processUpdate']({
        update_id: updateId++,
        message: { chat: { id: chatId }, from: { id: chatId }, text: input },
      });
    };

    await send(42, '/start');
    await send(42, 'O‘zbek tili');
    await send(42, 'Ali Valiyev');
    await send(42, "O'g'il");
    await send(42, "Qoraqalpog'iston Respublikasi");
    await send(42, 'Nukus shahar');
    await send(42, '15');
    await send(42, '9-sinf');
    for (let question = 0; question < 50; question++) {
      await send(42, 'Ha');
    }

    const restartedBot = new TelegramBotService();
    await restartedBot['loadSurveyResponses']();
    await restartedBot['processUpdate']({
      update_id: updateId++,
      message: { chat: { id: 749309408 }, from: { id: 749309408 }, text: '/start' },
    }, 'admin', 'admin-test-token');
    expect(requests.at(-1)?.url).toContain('/sendMessage');
    expect(String(requests.at(-1)?.options.body)).toContain('Excel faylini olish');
    await restartedBot['processUpdate']({
      update_id: updateId++,
      message: { chat: { id: 749309408 }, from: { id: 749309408 }, text: '9-sinf' },
    }, 'admin', 'admin-test-token');

    const documentRequest = requests.at(-1)!;
    expect(documentRequest.url).toContain('/sendDocument');
    expect(documentRequest.url).toContain('admin-test-token');
    expect(documentRequest.options.body).toBeInstanceOf(FormData);
    const form = documentRequest.options.body as FormData;
    const document = form.get('document');
    expect(document).toBeInstanceOf(Blob);
    expect((document as File).name).toBe('sinf-9-sorovnoma-javoblari.xlsx');
    const data = Buffer.from(await (document as Blob).arrayBuffer());
    expect(data.readUInt32LE(0)).toBe(0x04034b50);
  });

  it('exports the class questionnaire template even before responses exist', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'student-test-token';
    process.env.ADMIN_BOT_TOKEN = 'admin-test-token';
    process.env.ADMIN_CHAT_IDS = '749309408';
    const requests: Array<{ url: string; options: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();

    await bot['processUpdate']({
      update_id: 1,
      message: { chat: { id: 749309408 }, from: { id: 749309408 }, text: '/start' },
    }, 'admin', 'admin-test-token');
    await bot['processUpdate']({
      update_id: 2,
      message: { chat: { id: 749309408 }, from: { id: 749309408 }, text: '6-sinf' },
    }, 'admin', 'admin-test-token');

    expect(requests.map(({ url }) => url)).toEqual([
      expect.stringContaining('/sendMessage'),
      expect.stringContaining('/sendMessage'),
      expect.stringContaining('/sendDocument'),
    ]);
    const finalRequest = requests.at(-1);
    expect(finalRequest).toBeDefined();
    const requestBody = finalRequest!.options.body;
    expect(requestBody).toBeInstanceOf(FormData);
    const document = (requestBody as FormData).get('document') as Blob;
    const workbook = Buffer.from(await document.arrayBuffer());
    const worksheet = getWorksheetXml(workbook);
    expect(worksheet).toContain('Maktabda qaysi fanlarni');
    expect(worksheet).toContain('Какие школьные предметы');
    expect(worksheet).toContain('Topshirilgan vaqt');
    expect(worksheet).not.toContain('Savol №');
    expect(worksheet).toContain('r="W1"');
    expect(worksheet).not.toContain('r="A2"');
  });

  it('exports sixth-grade answers in one horizontal row per student without a question number column', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'student-test-token';
    process.env.ADMIN_BOT_TOKEN = 'admin-test-token';
    process.env.ADMIN_CHAT_IDS = '749309408';
    const requests: Array<{ url: string; options: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    bot['completedSurveys'].set(6, [{
      submittedAt: '2026-10-07T10:00:00.000Z',
      profile: {
        language: 'uz',
        name: 'Ali Valiyev',
        gender: "O'g'il",
        regionId: 1,
        district: 'Nukus shahar',
        age: 12,
      },
      grade: 6,
      answers: {
        0: ['Matematika'],
        1: ['Kitob o‘qish', 'Sport'],
        14: ['Maktab tashabbusi'],
      },
    }]);

    await bot['sendSurveyExport'](749309408, 6, 'admin-test-token');

    const finalRequest = requests.at(-1);
    expect(finalRequest?.url).toContain('/sendDocument');
    const requestBody = finalRequest!.options.body as FormData;
    const document = requestBody.get('document') as Blob;
    const worksheet = getWorksheetXml(Buffer.from(await document.arrayBuffer()));
    expect(worksheet.match(/<row r="2">/g)).toHaveLength(1);
    expect(worksheet).toContain('r="I1"');
    expect(worksheet).toContain('r="W1"');
    expect(worksheet).toContain('r="I2"');
    expect(worksheet).toContain('Matematika');
    expect(worksheet).toContain('Kitob o‘qish, Sport');
    expect(worksheet).toContain('Maktab tashabbusi');
    expect(worksheet).not.toContain('Savol №');
    expect(worksheet).not.toContain('r="X1"');
  });

  it('exports seventh-grade answers in one horizontal row per student without a question number column', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'student-test-token';
    process.env.ADMIN_BOT_TOKEN = 'admin-test-token';
    process.env.ADMIN_CHAT_IDS = '749309408';
    const requests: Array<{ url: string; options: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    bot['completedSurveys'].set(7, [{
      submittedAt: '2026-10-07T10:00:00.000Z',
      profile: {
        language: 'ru',
        name: 'Иван Иванов',
        gender: 'Мальчик',
        regionId: 1,
        district: 'г. Нукус',
        age: 13,
      },
      grade: 7,
      answers: {
        0: ['A) да'],
        1: ['B) иногда'],
        19: ['C) нет'],
      },
    }]);

    await bot['sendSurveyExport'](749309408, 7, 'admin-test-token');

    const finalRequest = requests.at(-1);
    expect(finalRequest?.url).toContain('/sendDocument');
    const requestBody = finalRequest!.options.body as FormData;
    const document = requestBody.get('document') as Blob;
    const worksheet = getWorksheetXml(Buffer.from(await document.arrayBuffer()));
    expect(worksheet.match(/<row r="2">/g)).toHaveLength(1);
    expect(worksheet).toContain('Ваши друзья с вами всегда согласны?');
    expect(worksheet).toContain('O‘rtoqlaringiz har doim ham');
    expect(worksheet).toContain('r="I1"');
    expect(worksheet).toContain('r="AB1"');
    expect(worksheet).toContain('r="I2"');
    expect(worksheet).toContain('A) да');
    expect(worksheet).toContain('B) иногда');
    expect(worksheet).toContain('C) нет');
    expect(worksheet).not.toContain('Savol №');
    expect(worksheet).not.toContain('r="AC1"');
  });

  it('exports eighth-grade answers in one horizontal row per student without a question number column', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'student-test-token';
    process.env.ADMIN_BOT_TOKEN = 'admin-test-token';
    process.env.ADMIN_CHAT_IDS = '749309408';
    const requests: Array<{ url: string; options: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    bot['completedSurveys'].set(8, [{
      submittedAt: '2026-10-07T10:00:00.000Z',
      profile: {
        language: 'ru',
        name: 'Иван Иванов',
        gender: 'Мальчик',
        regionId: 1,
        district: 'г. Нукус',
        age: 14,
      },
      grade: 8,
      answers: {
        0: ['Да'],
        1: ['Нет'],
        44: ['Да'],
      },
    }]);

    await bot['sendSurveyExport'](749309408, 8, 'admin-test-token');

    const finalRequest = requests.at(-1);
    expect(finalRequest?.url).toContain('/sendDocument');
    const requestBody = finalRequest!.options.body as FormData;
    const document = requestBody.get('document') as Blob;
    expect((document as File).name).toBe('sinf-8-sorovnoma-javoblari.xlsx');
    const worksheet = getWorksheetXml(Buffer.from(await document.arrayBuffer()));
    expect(worksheet.match(/<row r="2">/g)).toHaveLength(1);
    expect(worksheet).toContain('Uzoq vaqt harakatli o‘yinlar');
    expect(worksheet).toContain('Играть в подвижные игры?');
    expect(worksheet).toContain('r="I1"');
    expect(worksheet).toContain('r="BA1"');
    expect(worksheet).toContain('r="I2"');
    expect(worksheet).toContain('Да');
    expect(worksheet).toContain('Нет');
    expect(worksheet).not.toContain('Savol №');
    expect(worksheet).not.toContain('r="BB1"');
  });

  it('exports ninth-grade answers in one horizontal row per student without a question number column', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'student-test-token';
    process.env.ADMIN_BOT_TOKEN = 'admin-test-token';
    process.env.ADMIN_CHAT_IDS = '749309408';
    const requests: Array<{ url: string; options: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), {
        headers: { 'content-type': 'application/json' },
      });
    }));
    const bot = new TelegramBotService();
    bot['completedSurveys'].set(9, [{
      submittedAt: '2026-10-07T10:00:00.000Z',
      profile: {
        language: 'uz',
        name: 'Ali Valiyev',
        gender: "O'g'il",
        regionId: 1,
        district: 'Nukus shahar',
        age: 15,
      },
      grade: 9,
      answers: {
        0: ['Ha'],
        1: ['Yo‘q'],
        49: ['Ha'],
      },
    }]);

    await bot['sendSurveyExport'](749309408, 9, 'admin-test-token');

    const finalRequest = requests.at(-1);
    expect(finalRequest?.url).toContain('/sendDocument');
    const requestBody = finalRequest!.options.body as FormData;
    const document = requestBody.get('document') as Blob;
    expect((document as File).name).toBe('sinf-9-sorovnoma-javoblari.xlsx');
    const worksheet = getWorksheetXml(Buffer.from(await document.arrayBuffer()));
    expect(worksheet.match(/<row r="2">/g)).toHaveLength(1);
    expect(worksheet).toContain('Matematika va fizika sohasidagi yangiliklardan');
    expect(worksheet).toContain('Узнавать об открытиях в области физики');
    expect(worksheet).toContain('r="I1"');
    expect(worksheet).toContain('r="BF1"');
    expect(worksheet).toContain('r="I2"');
    expect(worksheet).toContain('Ha');
    expect(worksheet).toContain('Yo‘q');
    expect(worksheet).not.toContain('Savol №');
    expect(worksheet).not.toContain('r="BG1"');
  });
});
