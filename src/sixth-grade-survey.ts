export interface SurveyQuestion {
  prompt: string;
  type: 'multi' | 'choice' | 'text';
  options?: string[];
  followUpWhen?: string;
  followUpPrompt?: string;
}

export const sixthGradeSurvey: Record<'uz' | 'ru', SurveyQuestion[]> = {
  uz: [
    {
      prompt: '1. Maktabda qaysi fanlarni o‘rganish sizga ko‘proq yoqadi?',
      type: 'multi',
      options: [
        'Matematika', 'Ona tili va adabiyot', 'Tarix', 'Chet tili', 'Informatika',
        'Biologiya', 'Kimyo', 'Fizika', 'Musiqa', 'Tasviriy san’at',
        'Jismoniy tarbiya', 'Boshqa',
      ],
    },
    {
      prompt: '2. Bo‘sh vaqtingizda nimalar bilan shug‘ullanishni yoqtirasiz?',
      type: 'multi',
      options: [
        'Kitob o‘qish', 'Sport', 'Rasm chizish', 'Qo‘shiq aytish / cholg‘u',
        'Kompyuter va IT', 'Video / montaj / dizayn', 'Tabiat va hayvonlar',
        'Pazandachilik / hunar', 'Boshqa',
      ],
    },
    {
      prompt: '3. O‘zingizda qaysi qobiliyat kuchliroq deb o‘ylaysiz?',
      type: 'multi',
      options: [
        'Hisoblash va mantiq', 'Chiroyli gapirish', 'Rasm / chizma chizish',
        'Texnika va kompyuter', 'Musiqa va ijod', 'Sport', 'Tashkilotchilik',
        'Tinglash va yordam', 'Hali bilmayman',
      ],
    },
    {
      prompt: '4. Yangi narsani o‘rganishda qaysi usul sizga ko‘proq yoqadi?',
      type: 'multi',
      options: [
        'O‘qib o‘rganish', 'Amalda bajarib ko‘rish', 'Video orqali',
        'Ustozdan so‘rab', 'Do‘stlar bilan birgalikda', 'Tajriba qilib ko‘rish',
      ],
    },
    {
      prompt: '5. Quyidagi faoliyatlardan qaysi biri sizga eng qiziq?',
      type: 'multi',
      options: [
        'Kompyuter / IT', 'Tibbiyot', 'Texnika va muhandislik', 'San’at va ijod',
        'Sport', 'Ta’lim va pedagogika', 'Huquq va davlat xizmati',
        'Biznes va tadbirkorlik', 'Tabiat va ekologiya', 'Media / jurnalistika',
      ],
    },
    {
      prompt: '6. Kelajakda qaysi kasb yoki kasblarga qiziqasiz? Kasblarni vergul bilan ajratib yozing.',
      type: 'text',
    },
    {
      prompt: '7. Bu kasbga qiziqishingizga nima sabab bo‘lgan?',
      type: 'multi',
      options: [
        'Bu kasb menga yoqadi', 'Tanishim shu kasbda ishlaydi',
        'Bolaligimdan xohlayman', 'Daromadi yaxshi deb o‘ylayman',
        'Odamlarga yordam berish', 'Hali aniq bilmayman', 'Boshqa',
      ],
    },
    {
      prompt: '8. Siz ko‘proq qanday ishni bajarishni xohlaysiz?',
      type: 'multi',
      options: [
        'Odamlar bilan ishlash', 'Kompyuter bilan ishlash', 'Texnika va qurilmalar',
        'Hayvonlar va tabiat', 'Bolalar bilan ishlash', 'Ijodiy ishlar',
        'Mustaqil ishlash', 'Jamoa bilan ishlash',
      ],
    },
    {
      prompt: '9. Qaysi to‘garak yoki klub sizni ko‘proq qiziqtiradi?',
      type: 'multi',
      options: [
        'IT / robototexnika', 'Xorijiy tillar', 'Debat', 'Sport', 'Musiqa',
        'Teatr', 'Rasm / dizayn', 'Kitobxonlik', 'Ekologiya', 'Boshqa',
      ],
    },
    {
      prompt: '10. Maktabda yangi to‘garak ochilsa, qaysi yo‘nalishda bo‘lishini xohlardingiz?',
      type: 'text',
    },
    {
      prompt: '11. O‘zingizni kelajakda qanday inson sifatida tasavvur qilasiz?',
      type: 'multi',
      options: [
        'Yaxshi mutaxassis', 'Tadbirkor', 'Olim', 'Ijodkor', 'Sportchi',
        'Rahbar', 'O‘qituvchi', 'Boshqa',
      ],
    },
    {
      prompt: '12. Sizga kasb tanlashda kimning maslahati ko‘proq ta’sir qiladi?',
      type: 'multi',
      options: [
        'Ota-onam', 'O‘qituvchim', 'Sinfdoshlarim / do‘stlarim',
        'Maktab maslahatchisi', 'Psixolog', 'O‘zim mustaqil tanlayman', 'Boshqa',
      ],
    },
    {
      prompt: '13. Kelajakdagi kasbingiz haqida ma’lumot olishni xohlaysizmi?',
      type: 'choice',
      options: ['Ha', 'Yo‘q', 'Hali o‘ylab ko‘rmaganman'],
      followUpWhen: 'Ha',
      followUpPrompt: 'Qaysi kasb haqida ma’lumot olishni xohlaysiz?',
    },
    {
      prompt: '14. Maktab hayotini yaxshilash uchun qanday yangi g‘oya yoki tashabbus taklif qilgan bo‘lardingiz?',
      type: 'text',
    },
    {
      prompt: '15. O‘zingiz haqingizda biz bilishimiz kerak deb hisoblagan boshqa qiziqishingiz, qobiliyatingiz yoki orzuingiz bormi?',
      type: 'text',
    },
  ],
  ru: [
    {
      prompt: '1. Какие школьные предметы вам больше всего нравится изучать?',
      type: 'multi',
      options: [
        'Математика', 'Родной язык и литература', 'История', 'Иностранный язык',
        'Информатика', 'Биология', 'Химия', 'Физика', 'Музыка',
        'Изобразительное искусство', 'Физическая культура', 'Другое',
      ],
    },
    {
      prompt: '2. Чем вы любите заниматься в свободное время?',
      type: 'multi',
      options: [
        'Читать книги', 'Заниматься спортом', 'Рисовать',
        'Петь / играть на музыкальном инструменте', 'Компьютер и IT',
        'Видео / монтаж / дизайн', 'Природа и животные', 'Кулинария / рукоделие',
        'Другое',
      ],
    },
    {
      prompt: '3. Какую свою способность вы считаете наиболее развитой?',
      type: 'multi',
      options: [
        'Вычисления и логическое мышление', 'Умение красиво говорить',
        'Рисование / черчение', 'Техника и компьютер', 'Музыка и творчество',
        'Спорт', 'Организаторские способности', 'Умение слушать и помогать',
        'Пока не знаю',
      ],
    },
    {
      prompt: '4. Какой способ изучения нового вам нравится больше всего?',
      type: 'multi',
      options: [
        'Учиться по книгам', 'Выполнять на практике', 'С помощью видео',
        'Спрашивать у учителя', 'Вместе с друзьями', 'Проводить эксперименты',
      ],
    },
    {
      prompt: '5. Какой из следующих видов деятельности вам наиболее интересен?',
      type: 'multi',
      options: [
        'Компьютеры / IT', 'Медицина', 'Техника и инженерия',
        'Искусство и творчество', 'Спорт', 'Образование и педагогика',
        'Право и государственная служба', 'Бизнес и предпринимательство',
        'Природа и экология', 'Медиа / журналистика',
      ],
    },
    {
      prompt: '6. Какая профессия или профессии интересуют вас в будущем? Перечислите профессии через запятую.',
      type: 'text',
    },
    {
      prompt: '7. Что стало причиной вашего интереса к этой профессии?',
      type: 'multi',
      options: [
        'Мне нравится эта профессия', 'Мой знакомый работает по этой профессии',
        'Я хочу заниматься этой профессией с детства',
        'Думаю, что эта профессия хорошо оплачивается', 'Хочу помогать людям',
        'Пока точно не знаю', 'Другое',
      ],
    },
    {
      prompt: '8. Какую работу вы хотели бы выполнять больше всего?',
      type: 'multi',
      options: [
        'Работать с людьми', 'Работать с компьютером',
        'Работать с техникой и оборудованием', 'Работать с животными и природой',
        'Работать с детьми', 'Заниматься творческой работой',
        'Работать самостоятельно', 'Работать в команде',
      ],
    },
    {
      prompt: '9. Какой кружок или клуб вас интересует больше всего?',
      type: 'multi',
      options: [
        'IT / робототехника', 'Иностранные языки', 'Дебаты', 'Спорт',
        'Музыка', 'Театр', 'Рисование / дизайн', 'Клуб любителей чтения',
        'Экология', 'Другое',
      ],
    },
    {
      prompt: '10. Если в школе откроется новый кружок, по какому направлению вы хотели бы его посещать?',
      type: 'text',
    },
    {
      prompt: '11. Каким человеком вы представляете себя в будущем?',
      type: 'multi',
      options: [
        'Хорошим специалистом', 'Предпринимателем', 'Учёным',
        'Творческим человеком', 'Спортсменом', 'Руководителем', 'Учителем',
        'Другое',
      ],
    },
    {
      prompt: '12. Чьё мнение больше всего влияет на ваш выбор профессии?',
      type: 'multi',
      options: [
        'Моих родителей', 'Моего учителя', 'Моих одноклассников / друзей',
        'Школьного консультанта', 'Психолога', 'Я выбираю самостоятельно',
        'Другое',
      ],
    },
    {
      prompt: '13. Хотите ли вы получать информацию о своей будущей профессии?',
      type: 'choice',
      options: ['Да', 'Нет', 'Пока не задумывался(ась) об этом'],
      followUpWhen: 'Да',
      followUpPrompt: 'О какой профессии вы хотели бы получать информацию?',
    },
    {
      prompt: '14. Какую новую идею или инициативу вы предложили бы для улучшения школьной жизни?',
      type: 'text',
    },
    {
      prompt: '15. Есть ли у вас другие интересы, способности или мечты, о которых нам следует знать?',
      type: 'text',
    },
  ],
};

export const surveyLabels = {
  uz: {
    done: '✅ Tanladim',
    selected: 'Tanlangan javoblar:',
    chooseMultiple: 'Bir nechta javobni tanlashingiz mumkin. Tugatgach, «✅ Tanladim»ni bosing.',
    enterOther: 'Boshqa javobingizni yozing:',
    saved: 'Rahmat! 6-sinf savolnomasi yakunlandi. Javoblaringiz qabul qilindi.',
    invalidChoice: 'Iltimos, ko‘rsatilgan javoblardan birini tanlang.',
    empty: 'Davom etishdan oldin kamida bitta javobni tanlang.',
  },
  ru: {
    done: '✅ Готово',
    selected: 'Выбрано:',
    chooseMultiple: 'Можно выбрать несколько вариантов. Когда закончите, нажмите «✅ Готово».',
    enterOther: 'Напишите свой вариант:',
    saved: 'Спасибо! Анкета для 6-го класса завершена. Ваши ответы приняты.',
    invalidChoice: 'Пожалуйста, выберите один из предложенных вариантов.',
    empty: 'Перед продолжением выберите хотя бы один вариант.',
  },
};
