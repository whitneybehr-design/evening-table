from pathlib import Path
import json

base = Path(__file__).resolve().parent.parent
source = base / 'src'
data = (source / 'meal-data.js').read_text() + '\n' + (source / 'recipe-upgrades.js').read_text()
weekly = json.loads((source / 'weekly-surprises.json').read_text())
weekly_js = '\nconst WEEKLY = ' + json.dumps(weekly, ensure_ascii=False).replace('<', '\\u003c') + ';\n'
weekly_js += 'Object.assign(ING, WEEKLY.ingredients); RECIPES.push(...WEEKLY.recipes);\n'
script = (source / 'meal-planner-v4.js').read_text().replace('/*DATA*/', data + weekly_js).replace('/*PLAN*/', (source / 'compact-plan.js').read_text())
fragment = (source / 'evening-shell.html').read_text().replace('<!--SCRIPTS-->', '<script>\n' + script + '\n</script>')
head = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="robots" content="noindex,nofollow"><title>Evening Table</title><style>body{margin:0;padding:12px;background:light-dark(#eeeee7,#18221b);color-scheme:light dark}button,a,input,select{cursor:pointer}</style></head><body>'
(base / 'index.html').write_text(head + fragment + '</body></html>')
(base / 'build').mkdir(exist_ok=True)
(base / 'build' / 'meal-bundle.js').write_text(script)
print('Built index.html; weekly collection date: ' + weekly['updatedOn'])
