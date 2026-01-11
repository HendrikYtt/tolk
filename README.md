# Tolk

Real-time speech transcription and translation. I built this after moving to Norway to help me learn Norwegian - couldn't find a good free tool that does live transcription + translation together.

**Live demo:** https://tolk.hycapital.io/

## What it does

1. Listens to your microphone
2. Transcribes speech in real-time (ElevenLabs Scribe)
3. Translates to your target language (DeepL)

Works great for watching Norwegian TV, podcasts, or conversations.

## Tech stack

- **Frontend**: React, Vite, Tailwind
- **Backend**: Express, PostgreSQL, Socket.io
- **Infra**: Kubernetes, Terraform (AWS S3/CloudFront)
- **APIs**: ElevenLabs Scribe, DeepL

## Running locally

```bash
bun install

cp api/.env.example api/.env
cp frontend/.env.example frontend/.env
# Add your API keys

cd api && bun run knex migrate:latest
bun run --cwd api dev
bun run --cwd frontend dev
```

## License

MIT
