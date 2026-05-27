*** Settings ***
Test Teardown    Capture Page Screenshot
*** Variables ***
${BASE_URL}         https://the-internet.herokuapp.com/login
${BROWSER}          chrome
${USERNAME}         tomsmith
${VALID_PASSWORD}   SuperSecretPassword!
${WRONG_PASSWORD}   SuperSecretPassword
${WRONG_USERNAME}   avec
${USERNAME_FIELD}   id=username
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     css=button[type='submit']
${SUCCESS_MSG}      css=#flash.success
${ERROR_MSG}        css=#flash.error
${SUCCESS_TEXT}     You logged into a secure area!
${ERROR_PWD_TEXT}   Your password is invalid!
${ERROR_USR_TEXT}   Your username is invalid!
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login test suite for https://the-internet.herokuapp.com/login
Library          SeleniumLibrary

Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Username    ${USERNAME}
    And Enter Password     ${VALID_PASSWORD}
    And Click Login Button
    Then Verify Successful Login

TC_002 — Failed Login With Incorrect Password

    When Enter Username    ${USERNAME}
    And Enter Password     ${WRONG_PASSWORD}
    And Click Login Button
    Then Verify Invalid Password Error

TC_003 — Failed Login With Incorrect Username

    When Enter Username    ${WRONG_USERNAME}
    And Enter Password     ${WRONG_PASSWORD}
    And Click Login Button
    Then Verify Invalid Username Error