# After Callais GA — Cracking Atlas

An interactive dashboard documenting how the 2021 Georgia redistricting cycle cracked, packed, and diluted Latino and AAPI communities across five counties: **Gwinnett, Hall, Cobb, Forsyth, and Whitfield**.

Built as a steering-committee briefing tool for the Georgia redistricting coalition ahead of the **June 17, 2026 special session** called by Governor Kemp post-*Louisiana v. Callais*.

## What it shows

- **11 documented cracking, packing, dilution, fake-majority, and coalition-dismantling cases** across Congressional, State Senate, State House, and County Commission levels.
- **Demographic baselines** for each of the five focal counties.
- **Statewide population growth** by group, 2010–2020 — Latino +31.6%, AAPI +52.3%, White −4%.
- The **Unity Maps** alternative proposed by NAACP, GALEO, the People's Agenda, and the Urban League — and rejected by the Joint Reapportionment Committee.

## Filters

- By county (Gwinnett, Hall, Cobb, Forsyth, Whitfield)
- By affected community (Latino, AAPI)
- By redistricting level (Congressional, State Senate, State House, County Commission)

## Primary sources

- [Lawyers' Committee for Civil Rights Under Law complaint (Dec 30, 2021)](https://www.lawyerscommittee.org/wp-content/uploads/2021/12/GA-Redistricting-Compl.-filed.pdf) — every cracking case is sourced from this filing
- [NPR — Georgia's coalition districts (Dec 20, 2023)](https://www.npr.org/2023/12/20/1220384013/georgia-redistricting-voting-rights-act-coalition-districts)
- [GALEO Unity Maps (Oct 28, 2021)](https://galeo.org/georgia-unity-maps/)
- [Atlanta Voice — Cobb and Gwinnett commission maps (Feb 2022)](https://theatlantavoice.com/republicans-take-cobb-and-gwinnett-redistricting-fights-to-the-state-capitol/)
- 2020 Decennial Census via [Census.gov QuickFacts](https://www.census.gov/quickfacts)

## Stack

- Vite + React + TypeScript
- Recharts (population growth chart)
- Fontshare CDN (Satoshi + Gambarino)
- No backend, no database, no tracking. Static build.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview production build locally
```

## Deploy to GitHub Pages

This repo is configured to be GitHub-Pages friendly. To enable:

1. Push to GitHub.
2. In repo settings → Pages → Source: GitHub Actions.
3. Use the included `.github/workflows/deploy.yml` (commits on `main` auto-deploy to Pages).
4. Set the repo's Pages base path in `vite.config.ts` if your repo name isn't `ga-cracking`.

## Credits

Built for the Georgia redistricting coalition steering committee, May 2026. Not legal advice.

Maintained by [Rosario Palacios](https://github.com/) — Executive Director, Common Cause Georgia; steering committee member, Georgia immigrant rights table.
