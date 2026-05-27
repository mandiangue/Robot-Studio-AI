*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests Login - The Internet Herokuapp
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779892531433_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779892531433_1/resources/keywords.robot



*** Test Cases ***
TC_001 - Successful Login With Valid Credentials
    Given Navigate To Login Page
    When Fill Login Form    ${USERNAME}    ${PASSWORD}
    And Submit Login Form
    Then Verify Successful Login

TC_002 - Failed Login With Wrong Password
    Given Navigate To Login Page
    When Fill Login Form    ${USERNAME}    ${WRONG_PASSWORD}
    And Submit Login Form
    Then Verify Invalid Password Error

TC_003 - Failed Login With Wrong Username
    Given Navigate To Login Page
    When Fill Login Form    ${WRONG_USERNAME}    ${PASSWORD}
    And Submit Login Form
    Then Verify Invalid Username Error

TC_004 - Logout After Successful Login
    Given Navigate To Login Page
    When Fill Login Form    ${USERNAME}    ${PASSWORD}
    And Submit Login Form
    And Verify Successful Login
    When Perform Logout
    Then Verify Successful Logout