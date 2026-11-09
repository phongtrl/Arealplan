# Arealplan101


## Installerbar nettapp

Publiser filene på HTTPS (for eksempel GitHub Pages). Manifest, service worker og ikonfiler må være tilgjengelige under samme adresse som `index.html`. Relative stier støtter også publisering i en undermappe.

- Android: Bruk «Installer app» eller nettleserens installasjonsmeny.
- iOS: Åpne i Chrome eller Safari, velg Del → Legg til på Hjem-skjerm.
- Appens sider kan brukes uten nett etter første fullførte innlasting. Eksterne dokumenter krever nett.
- Prosjekter lagres lokalt; nettleser og installert app kan ha separate lagringsområder.

Ved endringer i filene som forhåndslagres, øk versjonen i `CACHE` i `sw.js`. En ny service worker aktiveres når hele utgaven er lastet ned. Appen lastes deretter på nytt når ingen dialog er åpen. Prosjekter slettes ikke.


## Appversjoner

`versions.js` er kilden for appens versjonsnummer og endringslogg. Nyeste oppføring står først og vises i bunnmenyen og på `#versjoner`. Fra og med 1.0.0 registreres nye utgivelser her; tidligere appversjoner er ikke rekonstruert.

Ved neste funksjonsendring: legg til en ny oppføring med økt minor-versjon (for eksempel 1.1.0). Ved feilretting: øk patch-versjonen (for eksempel 1.0.1). Skriv konkrete brukerrettede endringer, øk cache-versjonen i `sw.js`, og kjør `python scripts/prepare-release.py`. Dette oppdaterer `build.js` og `release.json`. Bygg-ID må alltid økes, også ved reversering til et lavere appversjonsnummer. `DATA.meta.versjon` gjelder bare fagdata og er uavhengig av appversjonen.
