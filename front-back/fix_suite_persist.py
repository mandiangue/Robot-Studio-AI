import os, sys

TARGET = 'qa-agent.js'
if not os.path.exists(TARGET):
    print(f"ERROR: {TARGET} not found"); sys.exit(1)

with open(TARGET, 'r', encoding='utf-8') as f:
    js = f.read()

# renderReportCard sauvegarde localStorage immédiatement
# mais renderConsolidatedSuiteReport_inline push le suite-report APRÈS
# Solution : ne pas sauvegarder localStorage dans renderReportCard pour les suites
# laisser saveCodeCards() dans renderConsolidatedSuiteReport_inline s'en charger

old = """  const reportEntry = { type: 'report', cardId, suiteCardId: suiteCardId||null, data: JSON.parse(JSON.stringify(data)) };
  window._codeCards.push(reportEntry);
  try { localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards)); } catch(e) {}
  updateStatsBar();
}"""

new = """  const reportEntry = { type: 'report', cardId, suiteCardId: suiteCardId||null, data: JSON.parse(JSON.stringify(data)) };
  window._codeCards.push(reportEntry);
  // Si c'est un rapport de suite, ne pas sauvegarder maintenant —
  // renderConsolidatedSuiteReport_inline appellera saveCodeCards() après avoir pushé le suite-report
  if (!suiteCardId) {
    try { localStorage.setItem('qa_code_cards', JSON.stringify(window._codeCards)); } catch(e) {}
  }
  updateStatsBar();
}"""

if old in js:
    js = js.replace(old, new)
    print("✅ Fix appliqué")
else:
    print("⚠️ Pattern not found")
    idx = js.find("window._codeCards.push(reportEntry)")
    if idx > 0:
        print(repr(js[idx:idx+200]))

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(js)
