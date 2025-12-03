import { GoogleGenAI } from "@google/genai";
import { EmojiType } from "../types";

// Initialize the Gemini client
// Note: In a real app, ensure process.env.API_KEY is set.
// For this demo environment, we assume it is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generates a creative description for a map marker based on its emoji and generic coordinates.
 */
export const generateMarkerDescription = async (
  emoji: EmojiType,
  lat: number,
  lng: number
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Klucz API Gemini nie został znaleziony. Wprowadź opis ręcznie.";
  }

  try {
    const prompt = `
      Użytkownik właśnie umieścił emoji "${emoji}" na mapie w Polsce (współrzędne: ${lat}, ${lng}).
      Napisz krótkie, zabawne i kreatywne jednozdaniowe zdanie w języku polskim, które opisuje to miejsce lub co się tam dzieje.
      Dostosuj ton do emoji (np. jedzenie -> smaczne, uwaga -> ostrzegawcze).
      Nie podawaj dokładnego adresu, tylko ogólny klimat.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Ciekawe miejsce na mapie!";
  } catch (error) {
    console.error("Błąd Gemini:", error);
    return "Nie udało się wygenerować opisu. Spróbuj wpisać własny.";
  }
};