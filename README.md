# Arealplan101


## Installerbar nettapp

Publiser filene på HTTPS (for eksempel GitHub Pages). Manifest, service worker og ikonfiler må være tilgjengelige under samme adresse som `index.html`. Relative stier støtter også publisering i en undermappe.

- Android: Bruk «Installer app» eller nettleserens installasjonsmeny.
- iOS: Åpne i Safari, velg Del → Legg til på Hjem-skjerm.
- Appens sider kan brukes uten nett etter første fullførte innlasting. Eksterne dokumenter krever nett.
- Prosjekter lagres lokalt; nettleser og installert app kan ha separate lagringsområder.

Ved endringer i filene som forhåndslagres, øk versjonen i `CACHE` i `sw.js`. En ny service worker aktiveres når tidligere appvinduer er lukket.


## Appversjoner

`versions.js` er kilden for appens versjonsnummer og endringslogg. Nyeste oppføring står først og vises i bunnmenyen og på `#versjoner`. Fra og med 1.0.0 registreres nye utgivelser her; tidligere appversjoner er ikke rekonstruert.

Ved neste funksjonsendring: legg til en ny oppføring med økt minor-versjon (for eksempel 1.1.0). Ved feilretting: øk patch-versjonen (for eksempel 1.0.1). Skriv konkrete brukerrettede endringer og øk cache-versjonen i `sw.js` samtidig. `DATA.meta.versjon` gjelder bare fagdata og er uavhengig av appversjonen.


Hele Git-historikken vises separat som revisjoner på versjonssiden. Kjør `python scripts/generate-history.py` før en utgivelse for å oppdatere `history.js`. Oversikten inkluderer alle commits frem til genereringen; utgivelsen som ennå ikke er committet beskrives i den nyeste oppføringen i `versions.js`.
