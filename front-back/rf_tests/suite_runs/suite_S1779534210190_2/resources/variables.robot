*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${LOGIN_URL}    ${BASE_URL}/login
${BROWSER}    chrome
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword123
${INVALID_USERNAME}    invaliduser
${SUCCESS_MESSAGE}    You logged into a secure area!
${ERROR_INVALID_PASSWORD}    Your password is invalid!
${ERROR_INVALID_USERNAME}    Your username is invalid!
${USERNAME_INPUT_FIELD}    id=username
${PASSWORD_INPUT_FIELD}    id=password
${LOGIN_BUTTON}    css=button[type='submit']
${ALERT_MESSAGE}    css=.alert