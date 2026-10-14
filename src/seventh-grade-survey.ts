import type { SurveyQuestion } from './sixth-grade-survey.js';

const uzQuestions = [
  'O‘rtoqlaringiz har doim ham sizning fikringizga qo‘shilishadimi?',
  'Turli vaziyatlardan chiqish yo‘llarini topa olasizmi?',
  'Sizga jamoatchilik ishlari bilan shug‘ullanish yoqadimi?',
  'Agar maqsadlaringizni amalga oshirish yo‘lida qiyinchilikka duch kelsangiz, ulardan voz kechasizmi?',
  'Siz har xil o‘yin va xursandchilik tadbirlarini o‘ylab topishni va tashkil etishni yoqtirasizmi?',
  'Siz ko‘p hollarda bugun bajarilishi kerak bo‘lgan ishlarni boshqa kunga ko‘chirasizmi?',
  'Siz o‘rtoqlaringiz uchun turli qiziqarli tadbirlarni tashkil eta olasizmi?',
  'Sizning o‘rtoqlaringiz bilan kelishmay qolishingiz ularning bergan va’dalarini bajarmasligi oqibatida bo‘lmasligi rostmi?',
  'Siz ko‘p hollarda topshiriqlarni bajarishda tashabbus ko‘rsatasizmi?',
  'Notanish vaziyatlarga yaxshi ko‘nikib ketmasligingiz rostmi?',
  'Boshlagan ishingizni tugata olmasangiz, asabiylashasizmi?',
  'O‘rtoqlaringiz bilan ko‘p muloqot sizni charchatib qo‘yishi rostmi?',
  'O‘rtoqlaringiz uchun ularga tegishli muammolarni yechishda ko‘pincha tashabbus ko‘rsatasizmi?',
  'O‘zingizning haq ekanligingizni isbotlash siz uchun unchalik muhim emasmi?',
  'Maktabdagi (sinfdagi) jamoat ishlarida qatnashasizmi?',
  'Agar do‘stlaringiz tomonidan fikringiz yoki qaroringiz qabul qilinmasa, ularni himoya qilishga harakat qilmasligingiz rostmi?',
  'O‘rtoqlaringiz uchun har xil tadbirlarni tashkil etishga chin dildan kirishasizmi?',
  'Uchrashuvlarga siz ko‘pincha kechikasizmi?',
  'Siz ko‘pincha hammaning diqqat markazida bo‘lasizmi?',
  'O‘zingizni notanish jamoada noqulay tutishingiz rostmi?',
];

const ruQuestions = [
  'Ваши друзья с вами всегда согласны?',
  'Можете ли вы найти выход из разных ситуаций?',
  'Вам нравится общественная работа?',
  'Если у вас возникнут трудности с достижением ваших целей, откажетесь ли вы от них?',
  'Вам нравится организовывать различные игры и весёлые мероприятия?',
  'Часто ли вы переносите работу, которую необходимо выполнить сегодня?',
  'Можете ли вы организовать различные весёлые мероприятия для своих друзей?',
  'Правда ли, что ваше несогласие с друзьями не связано с тем, что они не выполняют своих обещаний?',
  'Вы часто проявляете инициативу при выполнении заданий?',
  'Правда ли, что вы не привыкли к незнакомым ситуациям?',
  'Вы расстраиваетесь, если не можете закончить то, что начали?',
  'Правда ли, что общение с друзьями может быть утомительным?',
  'Вы часто проявляете инициативу для решения проблем своих друзей?',
  'Разве вам не важно доказать, что вы правы?',
  'Участвуете ли вы в школьных (классных) общественных работах?',
  'Правда ли, что вы не пытаетесь защитить своих друзей, если они не согласны с вами?',
  'Вы действительно хотите организовать различные мероприятия для своих друзей?',
  'Вы часто опаздываете на встречи?',
  'Вы часто находитесь в центре внимания?',
  'Правда ли, что вы чувствуете себя некомфортно в незнакомой среде?',
];

const makeQuestions = (
  prompts: string[],
  answers: [string, string, string],
): SurveyQuestion[] =>
  prompts.map((prompt, index) => ({
    prompt: `${index + 1}. ${prompt}`,
    type: 'choice',
    options: answers,
  }));

export const seventhGradeSurvey: Record<'uz' | 'ru', SurveyQuestion[]> = {
  uz: makeQuestions(uzQuestions, ['A) ha', 'B) ba’zan', 'C) yo‘q']),
  ru: makeQuestions(ruQuestions, ['A) да', 'B) иногда', 'C) нет']),
};
