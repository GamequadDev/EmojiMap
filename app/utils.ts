import { EmojiType } from './types';

// Helper to resolve emoji character from string (handles "FOOD" -> "🍔" and "🍔" -> "🍔")
export const resolveEmoji = (emojiStr: string): string => {
    // Check if the string matches a key in EmojiType
    // We need to cast to any or use a specific check because TypeScript enum keys are strings
    if (Object.keys(EmojiType).includes(emojiStr)) {
        return EmojiType[emojiStr as keyof typeof EmojiType];
    }
    // Otherwise assume it's already an emoji character or unknown
    return emojiStr;
};
