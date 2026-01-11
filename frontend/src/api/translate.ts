import { http } from './config';
import type { TranslateRequest, TranslateResponse } from '@tolk/shared';

export const TRANSLATE_API = {
    translate: (data: TranslateRequest) => http.post<TranslateResponse>('/translate', data),
};
