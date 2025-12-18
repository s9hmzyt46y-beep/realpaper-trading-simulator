# ✅ Deployment Checklist

## Prieš Deployment

### 1. Paruošk API Raktus
- [ ] **Google OAuth**
  - [ ] Client ID
  - [ ] Client Secret
  - [ ] Redirect URI sukonfigūruotas: `https://your-app.vercel.app/api/auth/callback/google`
  
- [ ] **InstantDB**
  - [ ] App ID (NEXT_PUBLIC_INSTANT_APP_ID)
  - [ ] Admin Token (INSTANT_ADMIN_TOKEN)
  
- [ ] **Twelve Data**
  - [ ] API Key (TWELVE_DATA_API_KEY)
  
- [ ] **OpenAI**
  - [ ] API Key (OPENAI_API_KEY)
  
- [ ] **NextAuth**
  - [ ] Secret sugeneruotas: `openssl rand -base64 32`

---

## 2. Lokalus Build Test

Paleisk terminale:

```bash
cd "/Users/laimis/Desktop/1 užduotis įstaitymui"
npm run build
```

Jei pavyksta - viskas gerai! ✅

---

## 3. Git Repository

### GitHub/GitLab/Bitbucket

1. **Sukurk naują repository** savo GitHub/GitLab/Bitbucket account
2. **Copy repository URL**
3. **Paleisk terminale**:

```bash
cd "/Users/laimis/Desktop/1 užduotis įstaitymui"
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

✅ **Patikrink**: Ar visi failai yra GitHub/GitLab/Bitbucket?

---

## 4. Vercel Setup

### Žingsnis 1: Prisijunk
1. Eik į [vercel.com](https://vercel.com)
2. Spausk **"Sign Up"** arba **"Log In"**
3. Pasirink **"Continue with GitHub"** (rekomenduojama)

### Žingsnis 2: Import Project
1. Vercel Dashboard → **"Add New..."** → **"Project"**
2. Pasirink **"Import Git Repository"**
3. Pasirink savo **`realpaper-trading-simulator`** repository
4. Vercel automatiškai aptiks Next.js projektą

### Žingsnis 3: Configure Environment Variables

Prieš deploy'inant, **pridėk Environment Variables**:

**Project Settings → Environment Variables:**

```
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=<sugeneruotas-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXT_PUBLIC_INSTANT_APP_ID=<your-instantdb-app-id>
INSTANT_ADMIN_TOKEN=<your-instantdb-admin-token>
TWELVE_DATA_API_KEY=<your-twelve-data-api-key>
OPENAI_API_KEY=<your-openai-api-key>
```

⚠️ **SVARBU**: 
- Visus variables pridėk į **Production**, **Preview**, ir **Development**
- `NEXTAUTH_URL` bus Vercel suteiktas URL (pvz., `https://realpaper-trading.vercel.app`)

### Žingsnis 4: Deploy!
1. Spausk **"Deploy"**
2. Lauk 2-3 minutes
3. Gausi URL: `https://your-project-name.vercel.app`

---

## 5. Google OAuth Update

**Po deployment**, atnaujink Google Cloud Console:

1. Eik į [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Pasirink savo **OAuth 2.0 Client ID**
4. **Authorized redirect URIs** → Pridėk:
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```
5. **Save**

---

## 6. Post-Deployment Testing

### ✅ Patikrink šiuos funkcionalumus:

- [ ] **Homepage** užsikrauna
- [ ] **Google Login** veikia
- [ ] **Portfolio** rodo duomenis
- [ ] **Trade** - gali pirkti akcijas
- [ ] **Trade** - gali parduoti akcijas
- [ ] **Charts** - rodo grafikus
- [ ] **Auto-refresh** veikia
- [ ] **Simulation Date Picker** veikia
- [ ] **AI Commentary** generuojasi

---

## 7. Monitoring

### Vercel Dashboard:
- **Deployments** - deployment istorija
- **Analytics** - lankytojų statistika
- **Logs** - runtime errors
- **Functions** - serverless function logs

### Patikrink logs, jei kažkas neveikia:
```
Vercel Dashboard → Your Project → Logs
```

---

## 🎉 Deployment Success!

Jei visi žingsniai žaliai ✅, tavo programa veikia:

**🌐 https://your-project-name.vercel.app**

---

## 🆘 Troubleshooting

### Build Failed
```bash
npm run build
```
Patikrink, ar build pavyksta lokaliai.

### Environment Variables Error
Patikrink, ar visi variables:
- Correct spelling
- No extra spaces
- All environments selected (Production, Preview, Development)

### Google OAuth Error
- Redirect URI turi būti **exact** Vercel URL
- Pridėk ir `http://localhost:3000/api/auth/callback/google` development'ui

### InstantDB Error
- App ID turi būti su `NEXT_PUBLIC_` prefix
- Admin Token be prefix

---

## 🔄 Updates

Norėdamas atnaujinti deployed app:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel **automatiškai** re-deploy'ins! 🚀

