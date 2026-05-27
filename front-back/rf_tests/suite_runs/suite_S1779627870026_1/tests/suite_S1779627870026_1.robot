*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests — Login scenarios for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627870026_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627870026_1/resources/keywords.robot

*** Test Cases ***
TC_001 — Login With Valid Credentials
    [Documentation]    Verify that a user can log in with valid credentials and sees the success message
    [Tags]             login    valid

    When Login With Valid Credentials
    Then Verify Successful Login


TC_002 — Login With Wrong Password
    [Documentation]    Verify that an error message is shown when the password is incorrect
    [Tags]             login    invalid    password

    When Login With Wrong Password
    Then Verify Invalid Password Error


TC_003 — Login With Wrong Username
    [Documentation]    Verify that an error message is shown when the username is incorrect
    [Tags]             login    invalid    username

    When Login With Wrong Username
    Then Verify Invalid Username Error


TC_004 — Logout After Successful Login
    [Documentation]    Verify that a user can log out after a successful login and sees the logout message
    [Tags]             login    logout

    And Login With Valid Credentials
    And Verify Successful Login
    When Perform Logout
    Then Verify Successful Logout