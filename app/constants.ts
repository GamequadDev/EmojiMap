import { EmojiType } from './types';

// Coordinates default map center
export const DEFAULT_CENTER = {
  lat: 50.0470038,
  lng: 19.8399847, // Krakow
  zoom: 13
};

export const AVAILABLE_EMOJIS = [
  { type: EmojiType.SMILE, label: 'Uśmiech' },
  { type: EmojiType.HEART, label: 'Ulubione' },
  { type: EmojiType.FOOD, label: 'Jedzenie' },
  { type: EmojiType.COFFEE, label: 'Kawa' },
  { type: EmojiType.PARTY, label: 'Impreza' },
  { type: EmojiType.NATURE, label: 'Natura' },
  { type: EmojiType.DANGER, label: 'Uwaga' },
  { type: EmojiType.HOME, label: 'Dom' },
  { type: EmojiType.WORK, label: 'Praca' },
  { type: EmojiType.MUSEUM, label: 'Muzeum' },
  { type: EmojiType.GYM, label: 'Siłownia' }
];