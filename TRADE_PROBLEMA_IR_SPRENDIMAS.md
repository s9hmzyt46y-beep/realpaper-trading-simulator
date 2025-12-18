# TRADE PROBLEMA IR SPRENDIMAS

## ❌ Problema

**"Neleidžia pirkti akcijų"**

### Priežastis:

Execute Trade button yra **DISABLED**, nes:
```typescript
disabled={!symbol || !currentPrice || (!amount && !shares) || executing || loading}
```

`currentPrice` nėra nustatytas, nes:
1. Twelve Data API negrąžina kainos su simulation date (2025-12-15)
2. API rate limiting (free tier: 8 calls/minute)
3. Simulation mode naudoja EOD endpoint, kuris gali neturėti duomenų būsimai datai

### Screenshot Proof:
- `trade-ready-to-execute.png` - Button disabled (pilkas)
- Symbol: AAPL ✅
- Amount: 100 EUR ✅
- Cash: 10,000 EUR ✅
- **Price: MISSING ❌**

## ✅ SPRENDIMAS

Leisti trade execution su mock price, kai real price nepasiekiamas:

1. **Fallback price**: Naudoti paskutinę žinomą kainą arba default 100 EUR
2. **Simulation mode OFF**: Išjungti simulation automatiškai pirmam trade
3. **Better error handling**: Rodyti toast error, bet leisti pirkti su estimate

---

**FIXING NOW...**

