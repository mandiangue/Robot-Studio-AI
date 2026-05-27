*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${USERNAME_VALID}    tomsmith
${PASSWORD_VALID}    SuperSecretPassword!
${PASSWORD_INVALID}    WrongPassword123
${USERNAME_INVALID}    wronguser
${LOGIN_BUTTON}    //button[@type='submit']
${USERNAME_FIELD}    //input[@id='username']
${PASSWORD_FIELD}    //input[@id='password']
${SUCCESS_MESSAGE}    //div[@id='flash' and contains(text(), 'You logged into a secure area!')]
${ERROR_MESSAGE}    //div[@id='flash' and contains(text(), 'Your username is invalid!') or contains(text(), 'Your password is invalid!')]
${SECURE_PAGE_HEADING}    //h2[contains(text(), 'Secure Area')]
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    Open Login Page
    Perform Login With Valid Credentials
    Verify Success Message Is Displayed
    Verify Secure Page Is Displayed


TC_002 Failed Login With Incorrect Password
    Open Login Page
    Perform Login With Invalid Password
    Verify Error Message Is Displayed
    Verify User Remains On Login Page


TC_003 Failed Login With Incorrect Username
    Open Login Page
    Perform Login With Invalid Username
    Verify Error Message Is Displayed
    Verify User Remains On Login Page
