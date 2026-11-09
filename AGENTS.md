# Release consistency

For changes to the app:

- Maintain the user-facing app version and release notes in `versions.js`. A user-requested rollback may lower that version.
- Always give `CACHE` in `sw.js` a new, unused generation, including for rollbacks.
- Run `python scripts/prepare-release.py` after changing the version or cache generation, and commit the resulting `build.js` and `release.json` together with the app changes.
- Keep the offline shell list in `sw.js` complete when adding runtime files.
- Never delete project localStorage to resolve an update problem. Updates must defer while a dialog is open and must not overwrite another window's project data.
