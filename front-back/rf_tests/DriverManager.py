"""
DriverManager.py — Gestion automatique des drivers via webdriver-manager
Utilise par SeleniumLibrary via la variable ${BROWSER}
"""
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService

def create_driver(browser='chrome', headless=False):
    browser = browser.lower()
    try:
        if browser in ('chrome', 'chromium'):
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.options import Options
            opts = Options()
            if headless:
                opts.add_argument('--headless=new')
            opts.add_argument('--disable-notifications')
            opts.add_argument('--disable-infobars')
            opts.add_argument('--disable-popup-blocking')
            opts.add_argument('--disable-save-password-bubble')
            opts.add_argument('--disable-features=PasswordManagerEnabled,TranslateUI')
            opts.add_argument('--no-first-run')
            opts.add_experimental_option('prefs', {
                'credentials_enable_service': False,
                'profile.password_manager_enabled': False,
                'profile.default_content_setting_values.notifications': 2,
                'profile.default_content_settings.popups': 0,
            })
            service = ChromeService(ChromeDriverManager().install())
            return webdriver.Chrome(service=service, options=opts)

        elif browser == 'firefox':
            from webdriver_manager.firefox import GeckoDriverManager
            from selenium.webdriver.firefox.options import Options
            opts = Options()
            if headless:
                opts.add_argument('--headless')
            service = FirefoxService(GeckoDriverManager().install())
            return webdriver.Firefox(service=service, options=opts)

        elif browser == 'edge':
            from webdriver_manager.microsoft import EdgeChromiumDriverManager
            from selenium.webdriver.edge.options import Options
            opts = Options()
            if headless:
                opts.add_argument('--headless=new')
            service = EdgeService(EdgeChromiumDriverManager().install())
            return webdriver.Edge(service=service, options=opts)

        else:
            raise ValueError(f"Navigateur non supporte: {browser}")

    except Exception as e:
        raise RuntimeError(f"Impossible de creer le driver {browser}: {e}")
