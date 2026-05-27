*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}    xpath=//button[@type='submit']
${SUCCESS_MESSAGE}    xpath=//div[@id='flash' and contains(text(), 'You logged into a secure area!')]
${ERROR_MESSAGE_INVALID_PASSWORD}    xpath=//div[@id='flash' and contains(text(), 'Your password is invalid!')]
${ERROR_MESSAGE_INVALID_USERNAME}    xpath=//div[@id='flash' and contains(text(), 'Your username is invalid!')]
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword
${INVALID_USERNAME}    invaliduser
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests for Login Functionality
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    Login With Valid Credentials
    Cleanup Browser

TC_002 Failed Login With Invalid Password
    Login With Invalid Password
    Cleanup Browser

TC_003 Failed Login With Invalid Username
    Login With Invalid Username
    Cleanup Browser