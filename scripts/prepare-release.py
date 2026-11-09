"""Kjør etter versjons- og cacheendringer, også ved reversering."""
from pathlib import Path
import json
import re
root = Path(__file__).resolve().parent.parent
version = re.search(r"version:\s*'([^']+)'", (root / 'versions.js').read_text()).group(1)
build = re.search(r"const CACHE = '([^']+)'", (root / 'sw.js').read_text()).group(1)
metadata = {'version': version, 'build': build}
(root / 'release.json').write_text(json.dumps(metadata, indent=2) + '\n')
(root / 'build.js').write_text('// Generert med scripts/prepare-release.py.\nwindow.APP_BUILD = ' + json.dumps(metadata) + ';\n')
print(f'{version}: {build}')
