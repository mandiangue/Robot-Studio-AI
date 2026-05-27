# no_popup.py
from selenium import webdriver

def create_chrome_options():
    opts = webdriver.ChromeOptions()
    opts.add_argument("--disable-notifications")
    opts.add_argument("--disable-save-password-bubble")
    opts.add_argument("--disable-features=PasswordManagerEnabled")
    opts.add_experimental_option("prefs", {
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False,
        "profile.default_content_setting_values.notifications": 2,
        "profile.default_content_settings.popups": 0,
    })
    return opts