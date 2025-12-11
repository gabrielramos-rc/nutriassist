# Deployment Summary

## Services

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| Vercel | Hosting | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Supabase | Database, Storage | [app.supabase.com](https://app.supabase.com/project/xeckvimqbosmmzjivxjp) |
| OpenRouter | LLM API | [openrouter.ai](https://openrouter.ai) |

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xeckvimqbosmmzjivxjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=https://nutriassist-one.vercel.app
```

## URLs

| Resource | URL |
|----------|-----|
| Production | https://nutriassist-one.vercel.app |
| Test Chat | https://nutriassist-one.vercel.app/chat/11111111-1111-1111-1111-111111111111 |
| GitHub | https://github.com/gabrielramos-rc/nutriassist |

## Deploy Commands

```bash
# Build locally first
npm run build

# Push to trigger deploy
git push origin main
```

## Deep Dive

- `../archived/DEPLOYMENT.md` - Full deployment guide with troubleshooting
