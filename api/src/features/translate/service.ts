import nodeFetch from 'node-fetch';
import { config } from '../../config';
import type { TranslateRequest, TranslateResponse } from '@tolk/shared';

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// Map ElevenLabs language codes to DeepL source language codes
const SOURCE_LANG_MAP: Record<string, string> = {
    no: 'NB', // Norwegian
    zh: 'ZH', // Chinese
    pt: 'PT', // Portuguese
};

const mapSourceLang = (lang?: string): string | undefined => {
    if (!lang) {
        return undefined;
    }
    const upper = lang.toUpperCase();
    return SOURCE_LANG_MAP[lang.toLowerCase()] || upper;
};

interface DeepLResponse {
    translations: Array<{
        text: string;
        detected_source_language: string;
    }>;
}

export const translateText = async (request: TranslateRequest): Promise<TranslateResponse> => {
    if (!config.DEEPL_API_KEY) {
        throw new Error('DEEPL_API_KEY is not configured');
    }

    const response = await nodeFetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `DeepL-Auth-Key ${config.DEEPL_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: [request.text],
            source_lang: mapSourceLang(request.sourceLang),
            target_lang: request.targetLang.toUpperCase(),
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepL API error: ${error}`);
    }

    const data = (await response.json()) as DeepLResponse;
    return {
        translatedText: data.translations[0].text,
        detectedSourceLang: data.translations[0].detected_source_language,
    };
};
