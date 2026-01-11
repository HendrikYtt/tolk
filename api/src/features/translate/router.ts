import { Router } from 'express';
import typia from 'typia';
import { validateBody } from '../../lib/validate';
import { asyncHandler } from '../../lib/async-handler';
import { translateText } from './service';
import type { TranslateRequest, TranslateResponse } from '@tolk/shared';

export const translateRouter = Router();

// POST /translate - Translate text using DeepL
translateRouter.post(
    '/',
    validateBody(typia.createValidateEquals<TranslateRequest>()),
    asyncHandler(async (req, res) => {
        const result = await translateText(req.body);
        res.json(result satisfies TranslateResponse);
    })
);
