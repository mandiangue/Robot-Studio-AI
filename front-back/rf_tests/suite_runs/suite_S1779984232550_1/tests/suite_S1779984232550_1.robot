*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests for Login functionality on the-internet.herokuapp.com
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779984232550_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779984232550_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    Navigate To Login Page
    Login With Credentials    ${VALID_USER}    ${VALID_PASS}
    Verify Successful Login

TC_002 — Failed Login With Wrong Password
    Navigate To Login Page
    Login With Credentials    ${VALID_USER}    ${WRONG_PASS}
    Verify Failed Login With Wrong Password
    Verify User Is On Login Page

TC_003 — Failed Login With Wrong Username
    Navigate To Login Page
    Login With Credentials    ${WRONG_USER}    ${VALID_PASS}
    Verify Failed Login With Wrong Username
    Verify User Is On Login Page

TC_004 — Logout After Successful Login
    Navigate To Login Page
    Login With Credentials    ${VALID_USER}    ${VALID_PASS}
    Verify Successful Login
    Perform Logout
    Verify Successful Logout
    Verify User Is On Login Page