*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword
${INVALID_USERNAME}    wronguser
${LOGIN_BUTTON}    xpath=//button[@type='submit']
${USERNAME_INPUT}    xpath=//input[@id='username']
${PASSWORD_INPUT}    xpath=//input[@id='password']
${SUCCESS_MESSAGE}    xpath=//*[contains(text(), 'You logged into a secure area!')]
${ERROR_MESSAGE_INVALID_PASSWORD}    xpath=//*[contains(text(), 'Your password is invalid!')]
${ERROR_MESSAGE_INVALID_USERNAME}    xpath=//*[contains(text(), 'Your username is invalid!')]
${PAGE_TITLE}    The Internet