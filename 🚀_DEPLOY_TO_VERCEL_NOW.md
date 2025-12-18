# 🚀 DEPLOY Į VERCEL - GREITI ŽINGSNIAI

## ✅ KAS JŪS PADARYTA:
- ✅ Git repository inicializuotas
- ✅ Visi failai commit'inti
- ✅ README ir deployment guide sukurti
- ✅ Programa ready for deployment!

---

## 📋 KO REIKIA:

### 1. API Raktai (turėtum turėti):
- Google OAuth (Client ID & Secret)
- InstantDB (App ID & Admin Token)  
- Twelve Data API Key
- OpenAI API Key

### 2. GitHub/GitLab Account
- Jei neturi, sukurk: [github.com](https://github.com)

---

## 🎯 DEPLOYMENT ŽINGSNIAI (5-10 MIN)

### ŽINGSNIS 1: Push į GitHub

```bash
# 1. Sukurk naują repository GitHub.com:
#    - Eik į github.com/new
#    - Repository name: "realpaper-trading-simulator"
#    - Public arba Private
#    - NESPAUSK "Initialize with README"
#    - Spausk "Create repository"

# 2. Copy repository URL (pvz., https://github.com/your-username/realpaper-trading-simulator.git)

# 3. Terminale paleisk:
cd "/Users/laimis/Desktop/1 užduotis įstaitymui"
git remote add origin https://github.com/YOUR-USERNAME/realpaper-trading-simulator.git
git branch -M main
git push -u origin main
```

✅ **Patikrink**: Ar failai matosi GitHub?

---

### ŽINGSNIS 2: Vercel Setup

#### A. Prisijunk prie Vercel

1. Eik į: **[vercel.com](https://vercel.com)**
2. Spausk **"Sign Up"**
3. Pasirink **"Continue with GitHub"** ⭐ (rekomenduojama)
4. Authorize Vercel su GitHub

#### B. Import Project

1. Vercel Dashboard → Spausk **"Add New..."** → **"Project"**
2. Pasirink **"Import Git Repository"**
3. Rask **"realpaper-trading-simulator"**
4. Spausk **"Import"**

#### C. Configure Project

**Project Name**: `realpaper-trading-simulator` (arba kitas)

**Framework Preset**: Next.js (automatiškai aptiks)

**Root Directory**: `./` (default)

**Build Command**: `next build` (default)

**Output Directory**: `.next` (default)

⚠️ **NESPAUSK "Deploy" DAR!**

---

### ŽINGSNIS 3: Environment Variables

**Svarbiausias žingsnis!** Pridėk Environment Variables:

1. Vercel Project Settings → **"Environment Variables"** tab

2. Pridėk **kiekvieną variable**:

```bash
# 1. NEXTAUTH_URL
Name: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
Environment: Production, Preview, Development

# 2. NEXTAUTH_SECRET
# Sugeneruok terminalėje: openssl rand -base64 32
Name: NEXTAUTH_SECRET
Value: <sugeneruotas-secret>
Environment: Production, Preview, Development

# 3. GOOGLE_CLIENT_ID
Name: GOOGLE_CLIENT_ID
Value: <your-google-client-id>
Environment: Production, Preview, Development

# 4. GOOGLE_CLIENT_SECRET
Name: GOOGLE_CLIENT_SECRET
Value: <your-google-client-secret>
Environment: Production, Preview, Development

# 5. NEXT_PUBLIC_INSTANT_APP_ID
Name: NEXT_PUBLIC_INSTANT_APP_ID
Value: <your-instantdb-app-id>
Environment: Production, Preview, Development

# 6. INSTANT_ADMIN_TOKEN
Name: INSTANT_ADMIN_TOKEN
Value: <your-instantdb-admin-token>
Environment: Production, Preview, Development

# 7. TWELVE_DATA_API_KEY
Name: TWELVE_DATA_API_KEY
Value: <your-twelve-data-api-key>
Environment: Production, Preview, Development

# 8. OPENAI_API_KEY
Name: OPENAI_API_KEY
Value: <your-openai-api-key>
Environment: Production, Preview, Development
```

**SVARBU**: 
- `NEXTAUTH_URL` bus rodomas po deployment (pvz., `https://realpaper-trading-abc123.vercel.app`)
- Pradžioje gali naudoti temporary URL, vėliau atnaujinsi

---

### ŽINGSNIS 4: Deploy! 🚀

1. Spausk **"Deploy"**
2. Lauk 2-3 minutes ☕
3. Deployment baigsis su ✅ arba ❌

**Jei ✅ (Success)**:
- Gausi URL: `https://your-project-name.vercel.app`
- **COPY tą URL!**

**Jei ❌ (Failed)**:
- Spausk "View Logs"
- Patikrink klaidą
- Dažniausiai - Environment Variables error

---

### ŽINGSNIS 5: Atnaujink NEXTAUTH_URL

1. Vercel → **Settings** → **Environment Variables**
2. Rask **NEXTAUTH_URL**
3. Spausk **"Edit"**
4. Pakeisk į **tikrą Vercel URL**: `https://your-project-name.vercel.app`
5. Spausk **"Save"**
6. Vercel → **Deployments** → Spausk **"Redeploy"**

---

### ŽINGSNIS 6: Google OAuth Redirect URI

**SVARBU**: Atnaujink Google Cloud Console!

1. Eik į: [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Pasirink savo **OAuth 2.0 Client ID**
4. **Authorized redirect URIs** → Spausk **"+ ADD URI"**
5. Pridėk:
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```
6. Spausk **"Save"**

---

## 🎉 TESTUOK DEPLOYED APP!

### 1. Atidaryk:
```
https://your-project-name.vercel.app
```

### 2. Patikrink:
- [ ] Homepage užsikrauna ✅
- [ ] Google Login veikia ✅
- [ ] Portfolio rodo duomenis ✅
- [ ] Trade - gali pirkti akcijas ✅
- [ ] Trade - gali parduoti akcijas ✅
- [ ] Charts atvaizduojami ✅

---

## 🆘 JEIGU KAŽKAS NEVEIKIA

### Build Failed
```bash
cd "/Users/laimis/Desktop/1 užduotis įstaitymui"
npm run build
```
Patikrink lokaliai, ar build pavyksta.

### "Invalid OAuth Redirect URI"
- Patikrink Google Cloud Console redirect URI
- Turi būti **exact** Vercel URL
- **Include** `/api/auth/callback/google`

### "InstantDB Error" arba "Database query failed"
- Patikrink Environment Variables:
  - `NEXT_PUBLIC_INSTANT_APP_ID` - su `NEXT_PUBLIC_` prefix
  - `INSTANT_ADMIN_TOKEN` - be prefix
- Vercel → **Deployments** → **"Redeploy"**

### "Failed to fetch stock prices"
- Patikrink `TWELVE_DATA_API_KEY`
- Patikrink Twelve Data limits (500 requests/day free tier)

### Kita klaida
- Vercel Dashboard → **Your Project** → **Logs**
- Spausk **"Real-time"** ir atnaujink puslapį
- Matai tikslų error message

---

## 🔄 UPDATES

Norėdamas atnaujinti deployed app:

```bash
cd "/Users/laimis/Desktop/1 užduotis įstaitymui"
git add .
git commit -m "Update feature"
git push
```

Vercel **automatiškai re-deploy'ins**! ⚡

---

## 📚 PAPILDOMA INFORMACIJA

- **Pilnas deployment guide**: `VERCEL_DEPLOYMENT.md`
- **Deployment checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Project README**: `README.md`

---

## 🎯 FINAL RESULT

Tavo programa bus pasiekiama:

**🌐 https://your-project-name.vercel.app**

Nuorodą gali dalintis su dėstytoju ir bet kuo! 🎊

---

## 💡 TIPS

### Custom Domain (Pasirinktinai)
1. Vercel → **Settings** → **Domains**
2. Pridėk savo domainą (pvz., `myapp.com`)
3. Atnaujink DNS records
4. Atnaujink `NEXTAUTH_URL` ir Google OAuth redirect URI

### Analytics
- Vercel → **Analytics** → Speed Insights ir Web Vitals

### Monitoring
- Vercel → **Logs** → Real-time error monitoring

---

# ✅ READY TO DEPLOY! 

**Sekantis žingsnis**: GitHub push ir Vercel import! 🚀

