from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def get_no_popup_options():
    opts = Options()
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
    return opts
