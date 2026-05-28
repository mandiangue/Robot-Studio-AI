import os, sys

TARGET = 'qa-agent.js'
if not os.path.exists(TARGET):
    print(f"ERROR: {TARGET} not found"); sys.exit(1)

with open(TARGET, 'r', encoding='utf-8') as f:
    js = f.read()

old = """  window._codeCards = (window._codeCards||[]).filter(c => false); // clear all
  localStorage.removeItem('qa_code_cards');"""

new = """  // Ne supprimer que les cartes de code (multi) — garder les rapports et suite-reports
  window._codeCards = (window._codeCards||[]).filter(c => c.type === 'report' || c.type === 'suite-report');"""

if old in js:
    js = js.replace(old, new)
    print("✅ Fix appliqué")
else:
    print("⚠️ not found")

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(js)
