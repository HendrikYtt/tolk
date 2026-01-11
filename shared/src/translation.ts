// Translation types and language constants

export interface TranslateRequest {
    text: string;
    sourceLang?: string;
    targetLang: string;
}

export interface TranslateResponse {
    translatedText: string;
    detectedSourceLang?: string;
}

// Supported languages for ElevenLabs Scribe V2
export const SUPPORTED_SOURCE_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'fi', name: 'Finnish' },
] as const;

// DeepL supported target languages
export const SUPPORTED_TARGET_LANGUAGES = [
    { code: 'EN-US', name: 'English (US)' },
    { code: 'EN-GB', name: 'English (UK)' },
    { code: 'ES', name: 'Spanish' },
    { code: 'DE', name: 'German' },
    { code: 'FR', name: 'French' },
    { code: 'IT', name: 'Italian' },
    { code: 'PT-BR', name: 'Portuguese (BR)' },
    { code: 'PT-PT', name: 'Portuguese (PT)' },
    { code: 'NL', name: 'Dutch' },
    { code: 'PL', name: 'Polish' },
    { code: 'JA', name: 'Japanese' },
    { code: 'KO', name: 'Korean' },
    { code: 'ZH', name: 'Chinese (simplified)' },
    { code: 'RU', name: 'Russian' },
    { code: 'AR', name: 'Arabic' },
    { code: 'SV', name: 'Swedish' },
    { code: 'DA', name: 'Danish' },
    { code: 'NB', name: 'Norwegian' },
    { code: 'FI', name: 'Finnish' },
] as const;

export type SourceLanguageCode = (typeof SUPPORTED_SOURCE_LANGUAGES)[number]['code'];
export type TargetLanguageCode = (typeof SUPPORTED_TARGET_LANGUAGES)[number]['code'];
