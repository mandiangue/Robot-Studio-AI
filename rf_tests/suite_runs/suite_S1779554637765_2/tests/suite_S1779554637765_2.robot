*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests — Login scenarios on the-internet.herokuapp.com
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779554637765_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779554637765_2/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify User Is Logged In Successfully

TC_002 — Failed Login With Incorrect Password

    When Enter Credentials With Invalid Password
    And Submit Login Form
    Then Verify Error Message For Invalid Password Is Displayed

TC_003 — Failed Login With Non-Existent Username

    When Enter Credentials With Invalid Username
    And Submit Login Form
    Then Verify Error Message For Invalid Username Is Displayed