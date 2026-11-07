# Arealplan101


## Installerbar nettapp

Publiser filene på HTTPS (for eksempel GitHub Pages). Manifest, service worker og ikonfiler må være tilgjengelige under samme adresse som `index.html`. Relative stier støtter også publisering i en undermappe.

- Android: Bruk «Installer app» eller nettleserens installasjonsmeny.
- iOS: Åpne i Safari, velg Del → Legg til på Hjem-skjerm.
- Appens sider kan brukes uten nett etter første fullførte innlasting. Eksterne dokumenter krever nett.
- Prosjekter lagres lokalt; nettleser og installert app kan ha separate lagringsområder.

Ved endringer i filene som forhåndslagres, øk versjonen i `CACHE` i `sw.js`. En ny service worker aktiveres når tidligere appvinduer er lukket.
