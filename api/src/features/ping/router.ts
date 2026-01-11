import { Router } from 'express';

export const pingRouter = Router();

// Liveness probe - simple health check
pingRouter.get('/liveness', (_req, res) => {
    res.json({ message: 'pong' });
});

// Readiness probe - tolk doesn't require database
pingRouter.get('/readiness', (_req, res) => {
    res.json({ message: 'pong' });
});
