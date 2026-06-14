#!/usr/bin/env python3
# inspect_dom.py — snapshot du DOM rendu (elements interactifs) pour la generation IA
# Universel : fonctionne sur pages statiques ET applis JS (SPA) car le DOM est extrait
# apres rendu dans Chrome headless.
# Usage : python inspect_dom.py <url> [wait_seconds]
# Sortie : JSON sur stdout  { url, title, count, elements: [...] }
import sys, json, time

EXTRACT_JS = """
const SEL = 'input, button, a[href], select, textarea, [role="button"], [onclick], form, label';
const out = [];
const els = document.querySelectorAll(SEL);
for (const el of els) {
  if (out.length >= 200) break;
  const item = { tag: el.tagName.toLowerCase() };
  const attrs = ['id','name','type','placeholder','href','value','aria-label','data-testid','role','for','action','method'];
  for (const a of attrs) {
    const v = el.getAttribute && el.getAttribute(a);
    if (v) item[a] = String(v).slice(0, 120);
  }
  if (el.className && typeof el.className === 'string' && el.className.trim()) {
    item.class = el.className.trim().split(/\\s+/).slice(0, 4).join(' ');
  }
  const t = (el.innerText || el.textContent || '').trim().replace(/\\s+/g, ' ');
  if (t) item.text = t.slice(0, 80);
  const r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  if (r && (r.width === 0 || r.height === 0)) item.hidden = true;
  out.push(item);
}
return out;
"""

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: inspect_dom.py <url> [wait_seconds]"}))
        return 1
    url = sys.argv[1]
    wait_s = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0

    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--window-size=1366,900")
    opts.add_argument("--disable-notifications")

    driver_path = None
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        driver_path = ChromeDriverManager().install()
    except Exception:
        pass

    drv = webdriver.Chrome(service=Service(driver_path), options=opts) if driver_path else webdriver.Chrome(options=opts)
    try:
        drv.set_page_load_timeout(30)
        drv.get(url)
        time.sleep(wait_s)  # laisser le JS rendre (SPA)
        elements = drv.execute_script(EXTRACT_JS)
        print(json.dumps({
            "url": url,
            "title": drv.title,
            "count": len(elements),
            "elements": elements,
        }, ensure_ascii=False))
        return 0
    except Exception as e:
        print(json.dumps({"error": str(e), "url": url}))
        return 1
    finally:
        try:
            drv.quit()
        except Exception:
            pass

if __name__ == "__main__":
    sys.exit(main())
