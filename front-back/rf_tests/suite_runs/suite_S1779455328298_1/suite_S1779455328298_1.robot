*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${USERNAME_VALID}    tomsmith
${PASSWORD_VALID}    SuperSecretPassword!
${USERNAME_INVALID}    invaliduser
${PASSWORD_INVALID}    wrongpassword
${LOCATOR_USERNAME_INPUT}    id=username
${LOCATOR_PASSWORD_INPUT}    id=password
${LOCATOR_LOGIN_BUTTON}    //button[@type='submit']
${LOCATOR_SUCCESS_MESSAGE}    id=flash
${LOCATOR_ERROR_MESSAGE}    id=flash
${SUCCESS_MESSAGE_TEXT}    You logged into a secure area!
${ERROR_INVALID_PASSWORD}    Your password is invalid!
${ERROR_INVALID_USERNAME}    Your username is invalid!
${SECURE_PAGE_URL}    https://the-internet.herokuapp.com/secure
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Application Test Cases
Library    SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials

    When User Enters Valid Credentials
    Then User Should Be Redirected To Secure Area
    And User Should See Success Message


TC_002 Failed Login With Invalid Password

    When User Enters Valid Username And Invalid Password
    Then User Should Remain On Login Page
    And User Should See Invalid Password Error Message


TC_003 Failed Login With Invalid Username

    When User Enters Invalid Username And Valid Password
    Then User Should Remain On Login Page
    And User Should See Invalid Username Error Message
