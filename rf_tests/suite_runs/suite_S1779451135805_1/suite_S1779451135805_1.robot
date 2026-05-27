*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${INVALID_PASSWORD}    WrongPassword
${INVALID_USERNAME}    invaliduser
${LOGIN_URL}    https://the-internet.herokuapp.com/login
${SECURE_AREA_URL}    https://the-internet.herokuapp.com/secure
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}    css=.fa.fa-2x.fa-sign-in
${ERROR_MESSAGE}    css=.flash.error
${WELCOME_MESSAGE}    css=h2
${LOGOUT_BUTTON}    css=.fa.fa-sign-out
${EXPECTED_SUCCESS_MESSAGE}    Welcome to the Secure Area!
${EXPECTED_INVALID_PASSWORD_ERROR}    Your password is invalid!
${EXPECTED_INVALID_USERNAME_ERROR}    Your username is invalid!
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Test Cases
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    [Documentation]    Verify that user can login with valid credentials tomsmith and SuperSecretPassword!
    Open The Login Page
    Login With Valid Credentials
    Verify Successful Login


TC_002 Failed Login With Invalid Password
    [Documentation]    Attempt to login with valid username but invalid password and verify error message
    Open The Login Page
    Login With Invalid Password
    Verify Invalid Password Error


TC_003 Failed Login With Invalid Username
    [Documentation]    Attempt to login with invalid username but valid password and verify error message
    Open The Login Page
    Login With Invalid Username
    Verify Invalid Username Error
