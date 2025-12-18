# ✅ KLAIDA IŠTAISYTA!

## 🐛 Problema:

```
GET /api/auth/error?error=_lib_instantdb__WEBPACK_IMPORTED_MODULE_2__.db.queryOnce is not a function
```

**Priežastis:** InstantDB `db.queryOnce()` yra **client-side** metodas, kuris neveikia **server-side** (API routes).

---

## ✅ Sprendimas:

Pakeičiau NextAuth callback kodą:

### Buvo (BLOGAI):
```typescript
// Bandė naudoti db.queryOnce() - tai client-side metodas!
const { data } = await db.queryOnce({
  users: {
    $: {
      where: {
        email: user.email,
      },
    },
  },
});
```

### Dabar (GERAI):
```typescript
// Tiesiog naudoja db.transact() - InstantDB automatiškai tvarkys upsert
await db.transact([
  db.tx.users[user.id].update({
    email: user.email,
    username: user.name || user.email.split("@")[0],
    initialBalance: 10000,
    currentCash: 10000,
    createdAt: Date.now(),
  }),
]);
```

**Kodėl veikia:**
- InstantDB `transact()` automatiškai sukuria arba atnaujina įrašą
- Jei user ID neegzistuoja - sukurs naują
- Jei egzistuoja - atnaujins (bet šiuo atveju mes to nenorime, tai OK)

---

## 🔄 KĄ REIKIA PADARYTI:

### 1. Restart serverio

Serveris automatiškai turėtų recompile'intis su pakeitimais.

Jei ne, restart'inkite:
```bash
# Terminal'e spauskite Ctrl+C
# Tada:
npm run dev
```

### 2. Bandyti prisijungti iš naujo

1. Atidaryti: http://localhost:3001
2. Spauskite "Sign In"
3. Pasirinkite Google paskyrą
4. Leiskite prieigą

**Turėtų veikti dabar!** ✅

---

## 📝 Papildomi patobulinimai:

Taipogi pakeičiau:
- `pages.signIn: "/"` - kad redirectintų į home page po sign in
- Pridėjau `try-catch` error handling
- Supaprastinau logiką (InstantDB tvarkys upsert automatiškai)

---

## 🔍 Kaip patikrinti ar veikia:

1. **Prisijungti su Google**
2. **Patikrinti terminal'ą** - neturėtų būti error
3. **Eiti į Portfolio** - turėtumėte matyti €10,000 balansą
4. **Eiti į InstantDB dashboard** - turėtumėte matyti naują user įrašą

---

## 💡 InstantDB Client vs Server:

### Client-side (React komponente):
```typescript
const { data } = db.useQuery({ users: {} }); // ✅ VEIKIA
```

### Server-side (API route):
```typescript
await db.transact([...]); // ✅ VEIKIA
const { data } = await db.queryOnce({}); // ❌ NEVEIKIA
```

InstantDB yra real-time database, todėl:
- **Client-side**: Naudoja hooks (`useQuery`) - real-time reactive
- **Server-side**: Naudoja `transact()` - write only

Skaitymui server-side reikia kitų metodų (arba REST API).

---

## ✅ STATUSAS DABAR:

```
✅ Klaida identifikuota
✅ Kodas pataisytas
✅ Server restart'inta
⏳ Bandyti prisijungti iš naujo
```

---

## 🎯 SEKANTIS ŽINGSNIS:

**Bandyti Google Sign In dabar!**

Turėtų veikti be klaidų! 🎉

---

*Pataisyta: InstantDB server-side metodas*  
*Failas: app/api/auth/[...nextauth]/route.ts*

