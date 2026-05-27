*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779893357575_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779893357575_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    Given Navigate To Login Page
    When Fill Login Form    ${USERNAME}    ${VALID_PASS}
    And Submit Login Form
    Then Successful Login Should Be Displayed

TC_002 — Failed Login With Wrong Password
    Given Navigate To Login Page
    When Fill Login Form    ${USERNAME}    ${WRONG_PASS}
    And Submit Login Form
    Then Invalid Password Error Should Be Displayed

TC_003 — Failed Login With Wrong Username
    Given Navigate To Login Page
    When Fill Login Form    ${WRONG_USER}    ${VALID_PASS}
    And Submit Login Form
    Then Invalid Username Error Should Be Displayed

TC_004 — Successful Logout After Valid Login
    Given Navigate To Login Page
    When Fill Login Form    ${USERNAME}    ${VALID_PASS}
    And Submit Login Form
    And Perform Logout
    Then Successful Logout Should Be Displayed