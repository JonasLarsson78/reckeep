# Vue 3 + TypeScript + Vite – Template

En komplett startmall för moderna Vue 3-projekt med TypeScript, Vite, Pinia, Vue Router, global SCSS och Vercel serverless functions (API-routes).

## Installerade paket

- **Vue 3** – UI-ramverk
- **TypeScript** – Typning
- **Vite** – Snabb utvecklingsserver och byggverktyg
- **Pinia** – State management
- **Vue Router** – Routing
- **Sass (Dart Sass)** – SCSS-stöd och variabler
- **Vercel Functions** – API-routes via `/api`-mappen

src/

## Projektstruktur

```
src/
	App.vue           # Huvudkomponent
	main.ts           # App-bootstrapping
	global.scss       # Global CSS/SCSS
	scss/variabels.scss # Globala SCSS-variabler (importeras automatiskt)
	components/       # (Tom, för egna komponenter)
	views/            # Sidor (HomeView, TestView)
	router/           # Routing (Vue Router)
	store/            # State management (Pinia)
api/
	hello.ts          # Exempel på Vercel serverless function (API-route)
```

## Vercel serverless functions (API-routes)

Alla filer i `api/`-mappen blir automatiskt tillgängliga som API-endpoints när du kör på Vercel eller med `vercel dev` lokalt.  
Exempel:  
`api/hello.ts` → `/api/hello`  
Returnerar t.ex. `{ "message": "hello world" }`.

## Globala SCSS-variabler

Alla SCSS-filer har automatiskt tillgång till variabler från `src/scss/variabels.scss` via Vite-konfigurationen:

```
@use '@/scss/variabels.scss' as *;
```

## Routing

Vue Router är förkonfigurerat med exempelrutter i `src/router/routes/index.ts` och två vyer (`HomeView`, `TestView`).

## State management

Pinia är installerat och ett exempelstore (`testStore`) finns i `src/store/testStore/`.

## Kommandon

- `npm install` – Installera alla beroenden
- `npm run dev` – Starta Vite-utvecklingsservern (endast frontend)
- `vercel dev` – Starta både frontend och API-routes lokalt via Vercel
- `npm run build` – Bygg för produktion
- `npm run preview` – Förhandsgranska produktion

## Övrigt

- `<script setup lang="ts">` används i alla Vue-komponenter
- Alias `@` pekar på `src/`-mappen
- Allt är förberett för att bygga vidare med komponenter, vyer, routing och state management

Läs mer om [Vue 3 + TypeScript](https://vuejs.org/guide/typescript/overview.html#project-setup), [Vite](https://vitejs.dev/guide/) och [Vercel Functions](https://vercel.com/docs/functions).
