# 🚀 Vercel Deployment Guide

## Prieš Deployment

### 1. Paruošk API Raktus

Tau reikės šių API raktų:

- ✅ **Google OAuth** credentials (Client ID & Secret)
- ✅ **InstantDB** App ID ir Admin Token
- ✅ **Twelve Data** API Key
- ✅ **OpenAI** API Key
- ✅ **NextAuth** Secret (sugeneruok su `openssl rand -base64 32`)

---

## Deployment Žingsniai

### 1. Prisijunk prie Vercel

1. Eik į [vercel.com](https://vercel.com)
2. Prisijunk su GitHub/GitLab/Bitbucket arba email

### 2. Import Project

#### **Variantas A: Per Git (Rekomenduojama)**

1. Sukurk GitHub/GitLab repository
2. Inicializuok Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```
3. Vercel dashboard spausk **"Add New Project"**
4. Pasirink savo repository
5. Vercel automatiškai aptiks Next.js projektą

#### **Variantas B: Per Vercel CLI**

1. Instaliuok Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Prisijunk:
   ```bash
   vercel login
   ```
3. Deploy:
   ```bash
   vercel
   ```

---

### 3. Konfigūruok Environment Variables

Vercel dashboard → **Settings** → **Environment Variables**, pridėk:

#### Production Environment Variables:

```
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_INSTANT_APP_ID=your-instantdb-app-id
INSTANT_ADMIN_TOKEN=your-instantdb-admin-token
TWELVE_DATA_API_KEY=your-twelve-data-api-key
OPENAI_API_KEY=your-openai-api-key
```

⚠️ **SVARBU**: 
- `NEXTAUTH_URL` turi būti tavo Vercel URL (pvz., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` generuok su: `openssl rand -base64 32`

---

### 4. Google OAuth Redirect URI

Atnaujink Google Cloud Console OAuth credentials:

1. Eik į [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Pasirink savo OAuth 2.0 Client ID
4. Pridėk **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
5. Išsaugok

---

### 5. Deploy!

1. **Jei naudoji Git**: 
   - Spausk **"Deploy"** Vercel dashboard
   - Arba commit ir push naujus pakeitimus - automatiškai deploy'ins

2. **Jei naudoji CLI**: 
   - Paleisk: `vercel --prod`

---

## Po Deployment

### ✅ Patikrink, ar veikia:

1. **Homepage**: `https://your-app.vercel.app`
2. **Google Login**: Prisijunk per Google
3. **Portfolio**: Patikrink, ar rodo duomenis
4. **Trade**: Pabandyk pirkti/parduoti akcijas
5. **Charts**: Patikrink, ar grafikai atvaizduojami

---

## Troubleshooting

### Problema: "Invalid OAuth Redirect URI"
**Sprendimas**: Patikrink, ar Google Cloud Console turi teisingą redirect URI.

### Problema: "InstantDB Error"
**Sprendimas**: Patikrink, ar `NEXT_PUBLIC_INSTANT_APP_ID` ir `INSTANT_ADMIN_TOKEN` teisingi.

### Problema: "Failed to fetch stock prices"
**Sprendimas**: Patikrink, ar `TWELVE_DATA_API_KEY` galioja.

### Problema: "Build Failed"
**Sprendimas**: 
```bash
npm run build
```
Vietiškai patikrink, ar yra build klaidų.

---

## Automatinis Re-deployment

Vercel automatiškai re-deploy'ins kiekvieną kartą, kai push'ini į `main` branch:

```bash
git add .
git commit -m "Update feature"
git push
```

---

## Custom Domain (Pasirinktinai)

1. Vercel dashboard → **Settings** → **Domains**
2. Pridėk savo domainą (pvz., `myapp.com`)
3. Atnaujink DNS records pagal Vercel instrukcijas
4. Atnaujink `NEXTAUTH_URL` į naują domainą
5. Atnaujink Google OAuth redirect URI

---

## 🎉 Sėkmės!

Tavo programa dabar turėtų veikti: **https://your-app.vercel.app**

Jei kyla problemų, patikrink:
- Vercel **Logs** (real-time deployment logs)
- Vercel **Functions** logs (runtime errors)

