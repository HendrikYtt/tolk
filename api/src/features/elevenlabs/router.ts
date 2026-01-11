import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { config } from '../../config';
import { BadRequestError } from '../../error';
import type { ElevenLabsTokenResponse } from '@tolk/shared';

export const elevenlabsRouter = Router();

// POST /elevenlabs/token - Get single-use token for ElevenLabs WebSocket
elevenlabsRouter.post(
    '/token',
    asyncHandler(async (_req, res) => {
        if (!config.ELEVENLABS_API_KEY) {
            throw new BadRequestError('ElevenLabs API key not configured');
        }

        const response = await fetch(
            'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
            {
                method: 'POST',
                headers: {
                    'xi-api-key': config.ELEVENLABS_API_KEY,
                },
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new BadRequestError(`Failed to get ElevenLabs token: ${error}`);
        }

        const data = (await response.json()) as { token: string };
        res.json({ token: data.token } satisfies ElevenLabsTokenResponse);
    })
);
