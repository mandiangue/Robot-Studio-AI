*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${LOGIN_URL}    ${BASE_URL}/login
${USERNAME_INPUT}    id=username
${PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}    xpath=//button[@type='submit']
${SUCCESS_MESSAGE}    You logged into a secure area!
${ERROR_PASSWORD_MESSAGE}    Your password is invalid!
${ERROR_USERNAME_MESSAGE}    Your username is invalid!
${MESSAGE_LOCATOR}    id=flash
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword
${INVALID_USERNAME}    invaliduser
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for Login Functionality
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    Login With Valid Credentials
    Verify Success Message


TC_002 Failed Login With Incorrect Password
    Login With Invalid Password
    Verify Error Password Message
    Verify User Remains On Login Page


TC_003 Failed Login With Incorrect Username
    Login With Invalid Username
    Verify Error Username Message
    Verify User Remains On Login Page
