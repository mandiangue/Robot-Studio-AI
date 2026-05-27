*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests Login — The Internet Herokuapp
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779891439520_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779891439520_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    Given Login With Valid Credentials
    Then Check Successful Login

TC_002 — Failed Login With Wrong Password
    Given Login With Wrong Password
    Then Check Invalid Password Error

TC_003 — Failed Login With Wrong Username
    Given Login With Wrong Username
    Then Check Invalid Username Error

TC_004 — Logout After Successful Login
    Given Login With Valid Credentials
    And Check Successful Login
    When Logout From Secure Area
    Then Check Successful Logout