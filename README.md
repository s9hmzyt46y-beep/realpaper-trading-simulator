# 📈 RealPaper Trading Simulator

Reali akcijų prekybos simuliacija su tikromis kainomis iš Twelve Data API. Programa leidžia vartotojams pirkti ir parduoti akcijas, sekti portfelį, matyti P/L istoriją ir eksperimentuoti su simuliacijos režimu.

## ✨ Funkcionalumas

### 🎯 Pagrindinės Funkcijos
- ✅ **Google OAuth Authentication** - saugus prisijungimas
- ✅ **Real-time Stock Prices** - tikros kainos iš Twelve Data
- ✅ **Buy/Sell Trades** - pirkimas ir pardavimas su fractional shares
- ✅ **Portfolio Management** - portfelio peržiūra ir P/L skaičiavimas
- ✅ **Auto-refresh** - automatinis kainų atnaujinimas (30-60s)
- ✅ **Trade History** - visi sandoriai su data ir kaina
- ✅ **3 Charts**: 
  - Symbol Price Chart (istorinės kainos)
  - Portfolio Value Over Time
  - Profit/Loss Over Time

### 🎁 Bonus Funkcijos
- ✅ **Simulation Mode** - prekiavimas su pasirinktomis istorinėmis datomis
- ✅ **AI News Commentary** - AI sugeneruoti komentarai apie akcijas
- ✅ **Multiple Languages** - EN/LT
- ✅ **Dark Mode** - tamsus režimas
- ✅ **Responsive Design** - veikia mobiliuose įrenginiuose

### 🚧 Būsimi Patobulinimai
- 🔲 Tournament Mode - turnyrai su leaderboard
- 🔲 Risk Profile - rizikos profilio analizė
- 🔲 Achievements - badge'ai už pasiekimus

---

## 🛠️ Technologijų Stack

- **Frontend**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: InstantDB (realtime NoSQL)
- **APIs**: 
  - Twelve Data (stock prices)
  - OpenAI (AI commentary)
- **Auth**: NextAuth.js (Google OAuth)
- **Charts**: Recharts
- **State Management**: Zustand
- **Deployment**: Vercel

---

## 🚀 Local Development

### Reikalavimai
- Node.js 18+
- npm arba yarn

### Instaliavimas

1. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd realpaper-trading-simulator
   ```

2. **Instaliuok dependencies**:
   ```bash
   npm install
   ```

3. **Sukurk `.env.local` failą** (žr. `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

4. **Užpildyk API raktus** `.env.local`:
   - Google OAuth credentials
   - InstantDB App ID ir Admin Token
   - Twelve Data API Key
   - OpenAI API Key
   - NextAuth Secret

5. **Paleisk development serverį**:
   ```bash
   npm run dev
   ```

6. **Atidaryk naršyklėje**: http://localhost:3000

---

## 🌐 Deployment į Vercel

Žiūrėk [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) su pilnomis instrukcijomis.

**Trumpai**:
1. Prisijunk prie [vercel.com](https://vercel.com)
2. Import projektą iš Git
3. Pridėk Environment Variables
4. Deploy!

---

## 📁 Projekto Struktūra

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth
│   │   ├── trades/execute/    # Trade execution
│   │   ├── user/init/         # User initialization
│   │   ├── stocks/            # Stock price API
│   │   └── ai/                # AI commentary
│   ├── portfolio/             # Portfolio page
│   ├── trade/                 # Trade page
│   ├── history/               # History page
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── charts/                # Chart components
│   ├── Navigation.tsx         # Navigation bar
│   └── SimulationDatePicker.tsx
├── lib/
│   ├── instantdb.ts           # InstantDB config
│   └── utils.ts               # Utility functions
├── store/
│   ├── simulationDate.ts      # Simulation state
│   └── autoRefresh.ts         # Auto-refresh state
└── i18n/
    ├── en.json                # English translations
    └── lt.json                # Lithuanian translations
```

---

## 🎨 Dizainas

- **Spalvų schema**: Žalia (Emerald) su gradientais
- **Typography**: Inter font
- **Components**: shadcn/ui (Radix UI)
- **Animations**: Tailwind CSS animations
- **Responsive**: Mobile-first design

---

## 📊 Duomenų Bazė (InstantDB)

### Schema:
```typescript
{
  users: {
    email: string,
    username: string,
    initialBalance: number,
    currentCash: number,
    createdAt: timestamp
  },
  positions: {
    userId: string,
    symbol: string,
    quantity: number,
    avgCostPerShare: number,
    totalCost: number
  },
  trades: {
    userId: string,
    symbol: string,
    type: "BUY" | "SELL",
    quantity: number,
    pricePerShare: number,
    totalAmount: number,
    tradeDate: timestamp
  },
  portfolioSnapshots: {
    userId: string,
    totalValue: number,
    cashBalance: number,
    positionsValue: number,
    profitLoss: number,
    profitLossPercent: number,
    snapshotDate: timestamp
  }
}
```

---

## 🔐 Environment Variables

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# InstantDB
NEXT_PUBLIC_INSTANT_APP_ID=your-app-id
INSTANT_ADMIN_TOKEN=your-admin-token

# APIs
TWELVE_DATA_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key
```

---

## 🧪 Testing

```bash
# Build test
npm run build

# Lint
npm run lint
```

---

## 📝 Licencija

MIT

---

## 👨‍💻 Autorius

Sukurta kaip University projektas.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [InstantDB](https://instantdb.com/)
- [Twelve Data](https://twelvedata.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
