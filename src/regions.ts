export interface Region {
  id: number;
  nameUz: string;
  nameRu: string;
}

export const regions: Region[] = [
  { id: 1, nameUz: "Qoraqalpog'iston Respublikasi", nameRu: 'Республика Каракалпакстан' },
  { id: 2, nameUz: 'Andijon viloyati', nameRu: 'Андижанская область' },
  { id: 3, nameUz: 'Buxoro viloyati', nameRu: 'Бухарская область' },
  { id: 4, nameUz: 'Jizzax viloyati', nameRu: 'Джизакская область' },
  { id: 5, nameUz: 'Qashqadaryo viloyati', nameRu: 'Кашкадарьинская область' },
  { id: 6, nameUz: 'Navoiy viloyati', nameRu: 'Навоийская область' },
  { id: 7, nameUz: 'Namangan viloyati', nameRu: 'Наманганская область' },
  { id: 8, nameUz: 'Samarqand viloyati', nameRu: 'Самаркандская область' },
  { id: 9, nameUz: 'Surxondaryo viloyati', nameRu: 'Сурхандарьинская область' },
  { id: 10, nameUz: 'Sirdaryo viloyati', nameRu: 'Сырдарьинская область' },
  { id: 11, nameUz: 'Toshkent viloyati', nameRu: 'Ташкентская область' },
  { id: 12, nameUz: "Farg'ona viloyati", nameRu: 'Ферганская область' },
  { id: 13, nameUz: 'Xorazm viloyati', nameRu: 'Хорезмская область' },
  { id: 14, nameUz: 'Toshkent shahri', nameRu: 'город Ташкент' },
];

export const districtsByRegionId: Record<number, string[]> = {
  1: [
    'Nukus shahar', 'Amudaryo tumani', 'Beruniy tumani', 'Bo‘zatov tumani',
    'Chimboy tumani', 'Ellikqal’a tumani', 'Kegeyli tumani', 'Mo‘ynoq tumani',
    'Nukus tumani', 'Qonliko‘l tumani', 'Qo‘ng‘irot tumani', 'Qorao‘zak tumani',
    'Shumanay tumani', 'Taxtako‘pir tumani', 'Taqiyatosh tumani', 'To‘rtko‘l tumani',
    'Xo‘jayli tumani',
  ],
  2: [
    'Andijon shahar', 'Xonobod shahar', 'Andijon tumani', 'Asaka tumani',
    'Baliqchi tumani', 'Buloqboshi tumani', 'Bo‘ston tumani', 'Jalaquduq tumani',
    'Izboskan tumani', 'Qo‘rg‘ontepa tumani', 'Marhamat tumani', 'Oltinko‘l tumani',
    'Paxtaobod tumani', 'Ulug‘nor tumani', 'Xo‘jaobod tumani', 'Shahrixon tumani',
  ],
  3: [
    'Buxoro shahar', 'Kogon shahar', 'Buxoro tumani', 'Vobkent tumani',
    'G‘ijduvon tumani', 'Jondor tumani', 'Kogon tumani', 'Qorako‘l tumani',
    'Qorovulbozor tumani', 'Olot tumani', 'Peshku tumani', 'Romitan tumani',
    'Shofirkon tumani',
  ],
  4: [
    'Jizzax shahar', 'Arnasoy tumani', 'Baxmal tumani', 'G‘allaorol tumani',
    'Do‘stlik tumani', 'Zarbdor tumani', 'Zafarobod tumani', 'Zomin tumani',
    'Mirzacho‘l tumani', 'Paxtakor tumani', 'Forish tumani', 'Sharof Rashidov tumani',
    'Yangiobod tumani',
  ],
  5: [
    'Qarshi shahar', 'Shahrisabz shahar', 'G‘uzor tumani', 'Dehqonobod tumani',
    'Kasbi tumani', 'Kitob tumani', 'Koson tumani', 'Ko‘kdala tumani',
    'Qamashi tumani', 'Qarshi tumani', 'Mirishkor tumani', 'Muborak tumani',
    'Nishon tumani', 'Chiroqchi tumani', 'Shahrisabz tumani', 'Yakkabog‘ tumani',
  ],
  6: [
    'Navoiy shahar', 'Zarafshon shahar', 'G‘ozg‘on shahar', 'Karmana tumani',
    'Konimex tumani', 'Qiziltepa tumani', 'Navbahor tumani', 'Nurota tumani',
    'Tomdi tumani', 'Uchquduq tumani', 'Xatirchi tumani',
  ],
  7: [
    'Namangan shahar', 'Davlatobod tumani', 'Yangi Namangan tumani', 'Kosonsoy tumani',
    'Mingbuloq tumani', 'Namangan tumani', 'Norin tumani', 'Pop tumani',
    'To‘raqo‘rg‘on tumani', 'Uychi tumani', 'Uchqo‘rg‘on tumani', 'Chortoq tumani',
    'Chust tumani', 'Yangiqo‘rg‘on tumani',
  ],
  8: [
    'Samarqand shahar', 'Kattaqo‘rg‘on shahar', 'Bulung‘ur tumani', 'Jomboy tumani',
    'Ishtixon tumani', 'Kattaqo‘rg‘on tumani', 'Qo‘shrabot tumani', 'Narpay tumani',
    'Nurobod tumani', 'Oqdaryo tumani', 'Payariq tumani', 'Pastdarg‘om tumani',
    'Paxtachi tumani', 'Samarqand tumani', 'Toyloq tumani', 'Urgut tumani',
  ],
  9: [
    'Termiz shahar', 'Angor tumani', 'Bandixon tumani', 'Boysun tumani',
    'Denov tumani', 'Jarqo‘rg‘on tumani', 'Qiziriq tumani', 'Qumqo‘rg‘on tumani',
    'Muzrabot tumani', 'Oltinsoy tumani', 'Sariosiyo tumani', 'Termiz tumani',
    'Uzun tumani', 'Sherobod tumani', 'Sho‘rchi tumani',
  ],
  10: [
    'Guliston shahar', 'Shirin shahar', 'Yangiyer shahar', 'Boyovut tumani',
    'Guliston tumani', 'Mirzaobod tumani', 'Oqoltin tumani', 'Sayxunobod tumani',
    'Sardoba tumani', 'Sirdaryo tumani', 'Xovos tumani',
  ],
  11: [
    'Nurafshon shahar', 'Olmaliq shahar', 'Angren shahar', 'Bekobod shahar',
    'Ohangaron shahar', 'Chirchiq shahar', 'Yangiyo‘l shahar', 'Bekobod tumani',
    'Bo‘ka tumani', 'Bo‘stonliq tumani', 'Zangiota tumani', 'Qibray tumani',
    'Quyichirchiq tumani', 'Oqqo‘rg‘on tumani', 'Ohangaron tumani', 'Parkent tumani',
    'Piskent tumani', 'Toshkent tumani', 'O‘rtachirchiq tumani', 'Chinoz tumani',
    'Yuqorichirchiq tumani', 'Yangiyo‘l tumani',
  ],
  12: [
    'Farg‘ona shahar', 'Marg‘ilon shahar', 'Quvasoy shahar', 'Qo‘qon shahar',
    'Bag‘dod tumani', 'Beshariq tumani', 'Buvayda tumani', 'Dang‘ara tumani',
    'Yozyovon tumani', 'Oltiariq tumani', 'Qo‘shtepa tumani', 'Rishton tumani',
    'So‘x tumani', 'Toshloq tumani', 'Uchko‘prik tumani', 'Farg‘ona tumani',
    'Furqat tumani', 'O‘zbekiston tumani', 'Quva tumani',
  ],
  13: [
    'Urganch shahar', 'Xiva shahar', 'Bog‘ot tumani', 'Gurlan tumani',
    'Qo‘shko‘pir tumani', 'Tuproqqal’a tumani', 'Urganch tumani', 'Hazorasp tumani',
    'Xiva tumani', 'Xonqa tumani', 'Shovot tumani', 'Yangiariq tumani',
    'Yangibozor tumani',
  ],
  14: [
    'Bektemir tumani', 'Mirzo Ulug‘bek tumani', 'Mirobod tumani', 'Olmazor tumani',
    'Sergeli tumani', 'Uchtepa tumani', 'Chilonzor tumani', 'Shayxontohur tumani',
    'Yunusobod tumani', 'Yakkasaroy tumani', 'Yangi Hayot tumani', 'Yashnobod tumani',
  ],
};

const cyrillic = (value: string): string =>
  value
    .toLocaleLowerCase()
    .replace(/o[ʻ'‘’`]/g, 'ў')
    .replace(/g[ʻ'‘’`]/g, 'ғ')
    .replace(/sh/g, 'ш')
    .replace(/ch/g, 'ч')
    .replace(/ng/g, 'нг')
    .replace(/yo/g, 'ё')
    .replace(/yu/g, 'ю')
    .replace(/ya/g, 'я')
    .replace(/ye/g, 'е')
    .replace(/[ʻ'‘’`]/g, '')
    .replace(/[a-z]/g, (letter) => {
      const letters: Record<string, string> = {
        a: 'а', b: 'б', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'ҳ', i: 'и',
        j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к',
        r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з',
      };
      return letters[letter] ?? letter;
    });

export function getDistrictLabel(name: string, language: 'uz' | 'ru'): string {
  if (language === 'uz') return name;
  const city = name.endsWith(' shahar');
  const place = name.replace(/ (shahar|tumani)$/, '');
  const russianPlace = cyrillic(place);
  const titlePlace = russianPlace.charAt(0).toLocaleUpperCase('ru-RU') + russianPlace.slice(1);
  return city ? `г. ${titlePlace}` : `район ${titlePlace}`;
}
