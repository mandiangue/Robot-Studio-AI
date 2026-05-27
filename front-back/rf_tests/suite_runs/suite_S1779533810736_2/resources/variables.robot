*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Variables for Login Application Tests

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${LOGIN_PAGE_URL}    ${BASE_URL}/login
${SECURE_AREA_URL}    ${BASE_URL}/secure
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword123
${INVALID_USERNAME}    invaliduser
${SELECTOR_USERNAME_INPUT}    id=username
${SELECTOR_PASSWORD_INPUT}    id=password
${SELECTOR_LOGIN_BUTTON}    css=button[type='submit']
${SELECTOR_SUCCESS_MESSAGE}    css=.flash.success
${SELECTOR_ERROR_MESSAGE}    css=.flash.error
${EXPECTED_SUCCESS_TEXT}    You logged into a secure area!
${EXPECTED_ERROR_PASSWORD}    Your password is invalid!
${EXPECTED_ERROR_USERNAME}    Your username is invalid!