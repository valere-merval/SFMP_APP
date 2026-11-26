import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Locale } from './i18n';

const STORAGE_KEY = 'sfmp.voiceGuidanceEnabled';

const LANGUAGE_MAP: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  ar: 'ar-SA',
  zh: 'zh-CN',
  ru: 'ru-RU',
};

type SpeechWindow = {
  speechSynthesis?: {
    cancel: () => void;
    speak: (utterance: { lang?: string; rate?: number; pitch?: number; volume?: number }) => void;
  };
  SpeechSynthesisUtterance?: new (text: string) => {
    lang: string;
    rate: number;
    pitch: number;
    volume: number;
  };
  navigator?: {
    language?: string;
  };
};

function getSpeechWindow() {
  return globalThis as typeof globalThis & SpeechWindow;
}

function isBrowserSpeechAvailable() {
  const browser = getSpeechWindow();
  return Boolean(browser.speechSynthesis && browser.SpeechSynthesisUtterance);
}

export async function loadVoiceGuidanceEnabled() {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored == null) {
    return true;
  }
  return stored !== 'false';
}

export async function saveVoiceGuidanceEnabled(enabled: boolean) {
  await AsyncStorage.setItem(STORAGE_KEY, String(enabled));
}

export function stopVoiceGuidance() {
  if (!isBrowserSpeechAvailable()) {
    return;
  }
  getSpeechWindow().speechSynthesis?.cancel();
}

export function speakVoiceGuidance(text: string, locale: Locale) {
  const browser = getSpeechWindow();
  if (!text || !isBrowserSpeechAvailable()) {
    return;
  }

  browser.speechSynthesis?.cancel();

  const Utterance = browser.SpeechSynthesisUtterance;
  if (!Utterance) {
    return;
  }

  const utterance = new Utterance(text);
  utterance.lang = LANGUAGE_MAP[locale] ?? browser.navigator?.language ?? 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  browser.speechSynthesis?.speak(utterance);
}
