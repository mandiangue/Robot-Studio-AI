*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${USERNAME_FIELD_SELECTOR}    id=username
${PASSWORD_FIELD_SELECTOR}    id=password
${LOGIN_BUTTON_SELECTOR}    xpath=//button[@type='submit']
${SUCCESS_MESSAGE_SELECTOR}    xpath=//div[@id='flash' and contains(text(), 'You logged into a secure area!')]
${ERROR_MESSAGE_INVALID_PASSWORD_SELECTOR}    xpath=//div[@id='flash' and contains(text(), 'Your password is invalid!')]
${ERROR_MESSAGE_INVALID_USERNAME_SELECTOR}    xpath=//div[@id='flash' and contains(text(), 'Your username is invalid!')]
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword
${INVALID_USERNAME}    invaliduser