*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${VALID_PASSWORD}
    Verify Successful Login


TC_002 Failed Login With Incorrect Password
    Open Login Page
    Login With Credentials    ${VALID_USERNAME}    ${INVALID_PASSWORD}
    Verify Failed Login


TC_003 Failed Login With Incorrect Username
    Open Login Page
    Login With Credentials    ${INVALID_USERNAME}    ${VALID_PASSWORD}
    Verify Failed Login