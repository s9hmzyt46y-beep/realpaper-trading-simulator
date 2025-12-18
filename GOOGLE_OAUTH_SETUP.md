# Google OAuth Setup Instructions

## Jūs turite gauti Google OAuth kredencialus

### Žingsnis po žingsnio:

#### 1. Eikite į Google Cloud Console
Atidaryti: https://console.cloud.google.com/

#### 2. Sukurti naują projektą (arba pasirinkti esamą)
- Spauskite "Select a project" viršuje
- Spauskite "NEW PROJECT"
- Pavadinimas: "RealPaper Trading"
- Spauskite "CREATE"

#### 3. Įjungti Google+ API
- Eikite į "APIs & Services" → "Library"
- Ieškokite "Google+ API"
- Spauskite "ENABLE"

#### 4. Sukurti OAuth 2.0 Credentials
- Eikite į "APIs & Services" → "Credentials"
- Spauskite "+ CREATE CREDENTIALS"
- Pasirinkite "OAuth client ID"
- Jei paprašo, sukonfigūruokite "OAuth consent screen":
  - User Type: "External"
  - App name: "RealPaper Trading"
  - User support email: jūsų el. paštas
  - Developer contact: jūsų el. paštas
  - Spauskite "SAVE AND CONTINUE" per visus žingsnius

#### 5. Sukonfigūruoti OAuth Client ID
- Application type: "Web application"
- Name: "RealPaper Trading Web"
- **Authorized JavaScript origins**:
  - http://localhost:3000
- **Authorized redirect URIs**:
  - http://localhost:3000/api/auth/callback/google
- Spauskite "CREATE"

#### 6. Nukopijuoti kredencialus
Jūs gausite:
- **Client ID** (prasideda su kazkoks-randomid.apps.googleusercontent.com)
- **Client Secret** (trumpas string)

#### 7. Įdėti į .env.local
Atidaryti `.env.local` failą ir pakeisti:
```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

---

## Kas dabar?

Po to kai gausite Google OAuth kredencialus:

1. Atnaujinkite `.env.local` su Google kredencialais
2. Įsitikinkite, kad Node.js įdiegtas: `node --version`
3. Įdiekite priklausomybes: `npm install`
4. Paleiskite aplikaciją: `npm run dev`
5. Atidaryti: http://localhost:3000

---

## Troubleshooting

**Klaida "redirect_uri_mismatch":**
- Patikrinkite, ar redirect URI tiksliai: `http://localhost:3000/api/auth/callback/google`
- Naudokite `http://` (ne `https://`) lokaliam developmentui

**Klaida "Access blocked":**
- Eikite į OAuth consent screen
- Pridėkite savo el. paštą į "Test users"

**Nėra Google+ API:**
- Tai normalu, Google+ nebeegzistuoja, bet NextAuth vis dar reikalauja šios API įjungtos
- Tiesiog enable'inkite ją, nors ji deprecated

