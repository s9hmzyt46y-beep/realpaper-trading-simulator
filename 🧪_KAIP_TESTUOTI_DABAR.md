# 🧪 KAIP TESTUOTI PROGRAMĄ DABAR

## ✅ KAS JJAU PATAISYTA (automatiškai)
1. ✅ Visi aplinkos kintamieji teisingai įkelti
2. ✅ InstantDB Admin SDK veikia
3. ✅ User initialization API pataisytas
4. ✅ Trade execution API pataisytas
5. ✅ Serveris perkrautas su nauju kodu

## 🎯 KĄ DABAR REIKIA PADARYTI (rankiniu būdu)

### 1. Patikrinti, Ar Serveris Veikia
Terminale turėtų būti:
```
✓ Ready in XXXms
- Environments: .env.local
```

Jei ne - paleisti: `npm run dev`

### 2. Atidaryti Naršyklę
```
http://localhost:3000
```

### 3. Prisijungti Per Google
1. Paspausti **"Sign In"** mygtuką (viršuje dešinėje)
2. Pasirinkti Google paskyrą
3. Leisti prieigą aplikacijai

**KAS TURĖTŲ NUTIKTI:**
- ✅ Nukreipia į `/portfolio` puslapį
- ✅ Viršuje dešinėje matosi jūsų vardas/email
- ✅ Matosi visos navigacijos nuorodos

### 4. Eiti į Trade Puslapį
Paspausti **"Trade"** nuorodą navigacijoje arba:
```
http://localhost:3000/trade
```

**KAS TURĖTŲ MATYTIS:**
- ✅ **Cash:** €10,000.00 (pradinis balansas)
- ✅ **Total Positions:** 0
- ✅ **Portfolio Value:** €10,000.00
- ✅ BUY/SELL mygtukai
- ✅ Symbol įvesties laukas
- ✅ Amount/Shares tabs
- ✅ "Execute Trade" mygtukas

### 5. Nusipirkti Akcijų

#### 5.1. Įvesti Simbolį
- Laukelyje "Enter symbol" įrašyti: **AAPL** (arba bet kurį kitą simbolį)
- Palaukti kelias sekundes - turėtų pasirodyti kaina (pvz., "Current Price: €XXX.XX")

#### 5.2. Įvesti Sumą
- Pasirinkti **"Amount (EUR)"** tab
- Įvesti: **100** (pirkti už 100 eurų)
- Turėtų parodyti, kiek akcijų gausiteJEGU kainos nerodo (dėl Twelve Data API limito), naudokite fallback - programa automatiškai naudos €100 kainą.

#### 5.3. Vykdyti Sandorį
- Paspausti **"Execute Trade"**

**KAS TURĖTŲ NUTIKTI:**
1. ✅ Toast pranešimas: "Trade executed successfully!"
2. ✅ **Cash** sumažėja nuo €10,000 iki €9,900
3. ✅ **Total Positions** pasikeičia iš 0 į 1
4. ✅ **Portfolio Value** atsinaujina
5. ✅ Terminale: `POST /api/trades/execute 200 in XXXms`
6. ✅ Terminale: `✅ User created...` arba `✅ User already exists`

### 6. Patikrinti Portfolio
Eiti į **"Portfolio"** puslapį:
```
http://localhost:3000/portfolio
```

**KAS TURĖTŲ MATYTIS:**
- ✅ Jūsų nupirktos akcijos pozicijoje
- ✅ Kiekis, vidutinė kaina, dabartinė vertė
- ✅ P/L (Profit/Loss) skaičiavimas
- ✅ Grafikai (jei data available)

### 7. Parduoti Akcijas
Grįžti į **"Trade"** puslapį:
1. Perjungti į **"SELL"** tab (viršuje)
2. Įvesti tą patį simbolį (**AAPL**)
3. Įvesti akcijų kiekį (dalį arba visas)
4. Paspausti **"Execute Trade"**

**KAS TURĖTŲ NUTIKTI:**
- ✅ Cash padidėja
- ✅ Pozicija sumažėja arba išnyksta (jei parduodate visas)
- ✅ Portfolio Value atsinaujina

## 🔍 JEIGU KAŽKAS NEVEIKIA

### Problema: "Failed to execute trade"
**Sprendimas:**
1. Atidaryti browser console (F12 → Console)
2. Pažiūrėti, ar yra raudonų klaidų
3. Terminale pažiūrėti, ar yra `❌` klaidų
4. Pranešti man, kokią klaidą matote

### Problema: Nematau "Cash", "Total Positions", "Portfolio Value"
**Sprendimas:**
1. Perkrauti puslapį (Ctrl+Shift+R arba Cmd+Shift+R)
2. Patikrinti browser console (F12)
3. Patikrinti, ar `db.useQuery` gražina duomenis

### Problema: Google OAuth neveikia
**Tikėtina priežastis:** Google OAuth kredencialai galioja tik `localhost:3000`

**Sprendimas:**
1. Patikrinti, ar serveris veikia `http://localhost:3000` (ne kitu portu)
2. Patikrinti, ar `.env.local` turi teisingus `GOOGLE_CLIENT_ID` ir `GOOGLE_CLIENT_SECRET`
3. Google Cloud Console patikrinti redirect URI: `http://localhost:3000/api/auth/callback/google`

### Problema: "User not loaded"
**Sprendimas:**
1. Terminale pažiūrėti, ar yra `✅ User created` arba `✅ User already exists`
2. Jei ne - perkrauti puslapį ir pažiūrėti terminalo logus
3. Patikrinti, ar InstantDB kintamieji teisingi:
   ```bash
   curl http://localhost:3000/api/debug-env
   ```

## 📞 Pranešimui Man
Jeigu kažkas neveikia, praneškite:
1. **Ką bandėte padaryti** (pvz., "nusipirkti AAPL akcijų")
2. **Ką matote ekrane** (pvz., "rodo 'Failed to execute trade'")
3. **Kas terminale** (nukopijuokite paskutines 20 eilučių)
4. **Kas browser console** (F12 → Console, nukopijuokite klaidas)

---

## ✅ SĖKMINGO TESTAVIMO PAVYZDYS

### Terminalas (turėtų būti):
```bash
✓ Ready in 1221ms
- Environments: .env.local
GET /api/auth/signin/google 302 in XXms
GET /portfolio 200 in XXms
GET /api/auth/session 200 in XXms
POST /api/user/init 200 in XXXms
✅ User created in InstantDB via Admin SDK
GET /trade 200 in XXms
POST /api/trades/execute 200 in XXXms
```

### Browser Console (turėtų būti):
```javascript
✅ User init triggered (Admin SDK)
✅ API Success: Trade executed successfully
```

### Trade Puslapis (turėtų matytis):
```
Cash:               €9,900.00   ← sumažėjo po pirmos pirkimo
Total Positions:    1           ← turite 1 poziciją
Portfolio Value:    €9,XXX.XX   ← priklauso nuo kainos
```

---

**SVARBU:** Testavimas turi būti atliekamas rankiniu būdu naršyklėje, nes automatinis browser testing negali pilnai užbaigti Google OAuth flow.

**Paskutinis Atnaujinimas:** 2025-12-16 23:05  
**Būsena:** ✅ Paruošta testavimui

