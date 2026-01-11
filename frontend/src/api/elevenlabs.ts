import { http } from './config';
import type { ElevenLabsTokenResponse } from '@tolk/shared';

export const ELEVENLABS_API = {
    getToken: () => http.post<ElevenLabsTokenResponse>('/elevenlabs/token'),
};
