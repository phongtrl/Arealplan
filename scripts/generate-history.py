"""Oppdater lokal utviklingshistorikk fra hele Git-historikken før en utgivelse."""
import json
import subprocess
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

root = Path(__file__).resolve().parent.parent
log = subprocess.check_output(['git', 'log', '--format=%H%x00%ct%x00%s'], cwd=root, text=True)
entries = []
for line in log.splitlines():
    sha, timestamp, subject = line.split('\0', 2)
    files = subprocess.check_output(['git', 'diff-tree', '--root', '--no-commit-id', '--name-only', '-r', sha], cwd=root, text=True).splitlines()
    title = subject
    if subject == 's':
        title = 'Tidlig oppdatering: ' + ', '.join(files)
    elif subject == 'Initial commit':
        title = 'Første innlegging av Arealplan'
    entries.append({'sha': sha, 'date': datetime.fromtimestamp(int(timestamp), ZoneInfo('Europe/Oslo')).date().isoformat(), 'title': title, 'originalTitle': subject, 'files': files})
(root / 'history.js').write_text('// Generert fra Git med scripts/generate-history.py. Nyeste revisjon først.\nwindow.APP_HISTORY = ' + json.dumps(entries, ensure_ascii=False, indent=2) + ';\n')
print(f'Generated {len(entries)} revisions')
