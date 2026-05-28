*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests Login Scenarios
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779977415724_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779977415724_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Login With Credentials    ${USERNAME}    ${PASSWORD}
    Then Verify Successful Login

TC_002 — Failed Login With Incorrect Password

    When Login With Credentials    ${USERNAME}    ${WRONG_PASS}
    Then Verify Invalid Password Error

TC_003 — Failed Login With Incorrect Username

    When Login With Credentials    ${WRONG_USER}    ${PASSWORD}
    Then Verify Invalid Username Error

TC_004 — Logout After Successful Login

    When Login With Credentials    ${USERNAME}    ${PASSWORD}
    And Verify Successful Login
    And Logout From Secure Area
    Then Verify Successful Logout