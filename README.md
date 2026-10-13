# MAÎTRE-OS — Service Floor & Table Yield Triage

Copenhagen Bistro themed front-of-house triage for Friday dinner service. Rescues late tables, seats VIP bar queue, fires kitchen allergy slips. 100% client-side.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Build
```bash
npm run build
npm run preview
```

## Deploy
- **Vercel:** `npm i -g vercel && vercel --prod` (framework preset: Vite, build `npm run build`, output `dist`)
- **Netlify:** `npm run build` then drag `dist/` to Netlify Drop, or `netlify deploy --prod --dir dist`
- **GitHub Pages:** `npm run build`, push `dist/` via `gh-pages -d dist`

## 60-second mission
1. Click **Spot Table 14 now** (filters Late / No-Show).
2. Click **Release and re-seat** on Table 14. Vance 4-top auto-selected.
3. Confirm. Expediter slip opens. Click **Copy slip to chef pass**.

State persists in `localStorage` key `maitre_os_service_state_v1`. Use **Reset Friday Shift** in header to restore seed.
