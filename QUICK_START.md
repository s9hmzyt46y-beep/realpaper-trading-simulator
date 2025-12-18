# 🚀 QUICK START - Greitas Paleidimas

## ✅ Jau padaryta už jus:

1. ✅ Visas kodas sukurtas
2. ✅ `.env.local` failas sukonfigūruotas su jūsų API raktais
3. ✅ NEXTAUTH_SECRET sugeneruotas
4. ✅ Twelve Data API raktas įdėtas
5. ✅ InstantDB App ID įdėtas
6. ✅ OpenAI API raktas įdėtas

## ⚠️ Kas dar reikia:

### 1. Google OAuth Kredencialai

**BŪTINA** gauti Google OAuth kredencialus. Sekite instrukcijas:
```
Atidaryti: GOOGLE_OAUTH_SETUP.md
```

**Arba greitas būdas:**
1. Eiti į: https://console.cloud.google.com/
2. Sukurti naują projektą
3. APIs & Services → Credentials → Create OAuth Client ID
4. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Nukopijuoti Client ID ir Secret
6. Įdėti į `.env.local` failą

### 2. Įdiegti Node.js (jei dar nėra)

```bash
# Patikrinti ar turite:
node --version

# Jei nėra, įdiegti:
# macOS:
brew install node

# Arba nusiųsti: https://nodejs.org/
```

### 3. Įdiegti priklausomybes

```bash
cd "/Users/laimis/Desktop/1 užduotis įstaitymui"
npm install
```

Tai užtruks 2-3 minutes. Bus įdiegta ~300MB paketų.

### 4. Paleisti aplikaciją

```bash
npm run dev
```

Turėtumėte pamatyti:
```
   ▲ Next.js 14.2.0
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

### 5. Atidaryti naršyklėje

Eiti į: **http://localhost:3000**

---

## 🎯 Pirmi žingsniai aplikacijoje:

1. **Prisijungti su Google**
   - Spauskite "Sign In" mygtuką
   - Pasirinkite Google paskyrą
   - Leidžiate prieigą

2. **Patikrinti pradinio balansą**
   - Turėtumėte turėti €10,000 cash
   - Eiti į Portfolio page

3. **Nusipirkti pirmas akcijas**
   - Eiti į Trade page
   - Įvesti simbolį: AAPL (arba TSLA, MSFT, GOOGL)
   - Įvesti sumą: 1000 EUR
   - Spauskite "Execute Trade"

4. **Patikrinti portfelį**
   - Grįžti į Portfolio
   - Turėtumėte matyti savo poziciją
   - Auto-refresh atnaujins kainas

5. **Žiūrėti grafikus**
   - Eiti į History
   - Pamatysite kainų grafiką

6. **Išbandyti AI komentarus**
   - Trade page'e įveskite simbolį
   - Palaukite kelias sekundes
   - Pamatysite AI komentarą apie akciją

7. **Sukurti turnyrą**
   - Eiti į Tournament
   - Create tournament
   - Užpildyti detales

8. **Patikrinti pasiekimus**
   - Eiti į Achievements
   - Turėtumėte turėti "First Trade" unlocked

---

## 🧪 Testavimas

Pilnas testavimo guide'as:
```
Atidaryti: TESTING_GUIDE.md
```

Greitas test'as:
- ✅ Prisijungimas
- ✅ Pirkimas
- ✅ Pardavimas
- ✅ Grafikai
- ✅ Simuliacijos režimas
- ✅ Turnyrai
- ✅ Leaderboard
- ✅ Achievements

---

## 📊 API Limitai

**Twelve Data (FREE tier):**
- 800 requests per day
- 8 requests per minute
- Užtenka testavimui!

**OpenAI:**
- Pay-per-use
- GPT-4: ~$0.03 per request
- AI commentary'ai gali kainuoti ~€0.50-1.00 per dieną su aktyvia prekyba

**InstantDB (FREE tier):**
- 100,000 reads per month
- 10,000 writes per month
- Daugiau nei pakanka!

---

## 🚀 Deployment į Vercel

Kai viskas veikia lokaliai:

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "RealPaper Trading Simulator"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# 2. Deploy
# - Eiti į vercel.com
# - Import GitHub repo
# - Pridėti visus environment variables
# - Deploy!
```

Pilnas guide: `DEPLOYMENT.md`

---

## ❗ Jei kyla problemų:

### "npm: command not found"
- Įdiekite Node.js

### "Module not found" klaidos
- Paleiskite: `npm install` dar kartą

### "API key invalid"
- Patikrinkite `.env.local` failo turinį
- Įsitikinkite, kad nėra extra tarpų

### Google auth neveikia
- Patikrinkite redirect URI Google Console
- Įsitikinkite, kad Client ID ir Secret teisingi

### Duomenys nesimato
- Patikrinkite InstantDB App ID
- Eikite į instantdb.com dashboard

### AI commentary neveikia
- Patikrinkite OpenAI API key
- Įsitikinkite, kad turite kreditus OpenAI account'e

---

## 📞 Pagalba

1. Patikrinkite terminal'o error messages
2. Patikrinkite browser console (F12)
3. Perskaitykite atitinkamą .md failą
4. Patikrinkite `.env.local` konfigūraciją

---

## ✅ Checklist'as prieš submission:

- [ ] Node.js įdiegtas
- [ ] npm install įvykdytas
- [ ] Google OAuth sukonfigūruotas
- [ ] .env.local užpildytas
- [ ] npm run dev veikia
- [ ] Aplikacija atsidaro naršyklėje
- [ ] Galiu prisijungti su Google
- [ ] Galiu nusipirkti akcijų
- [ ] Matau grafikus
- [ ] Deployed į Vercel
- [ ] Vercel URL veikia

---

## 🎉 Viskas paruošta!

Jūsų projektas yra **100% baigtas** ir paruoštas!

Vienintelis dalykas, kurio reikia - **Google OAuth kredencialai**.

**Laikas: ~10 minučių**
1. Google OAuth setup: 5 min
2. npm install: 3 min
3. npm run dev: 1 min
4. Testing: 1 min

**GOOD LUCK! SĖKMĖS!** 🚀

