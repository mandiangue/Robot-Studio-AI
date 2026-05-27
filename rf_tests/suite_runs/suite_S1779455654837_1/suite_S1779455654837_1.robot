*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword123
${INVALID_USERNAME}    nonexistentuser
${LOGIN_BUTTON}    xpath=//button[@type='submit']
${USERNAME_INPUT}    xpath=//input[@id='username']
${PASSWORD_INPUT}    xpath=//input[@id='password']
${ERROR_MESSAGE}    xpath=//div[@id='flash']
${LOGOUT_BUTTON}    xpath=//a[@href='/logout']
${SUCCESS_MESSAGE_TEXT}    You logged into a secure area!
${INVALID_PASSWORD_ERROR}    Your password is invalid!
${INVALID_USERNAME_ERROR}    Your username is invalid!
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    Login With Valid Credentials
    Verify Successful Login


TC_002 Failed Login With Invalid Password
    Login With Invalid Password
    Verify Invalid Password Error


TC_003 Failed Login With Invalid Username
    Login With Invalid Username
    Verify Invalid Username Error
