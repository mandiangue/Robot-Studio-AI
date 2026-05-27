*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for login scenarios on the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627141831_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627141831_1/resources/keywords.robot

*** Test Cases ***
TC_001 — Login With Valid Credentials
    [Documentation]    Verify that a user can log in with valid credentials and is redirected to the secure area
    [Tags]             login    positive

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Successful Login


TC_002 — Login With Wrong Password
    [Documentation]    Verify that an error message is displayed when login is attempted with an incorrect password
    [Tags]             login    negative

    When Enter Credentials With Wrong Password
    And Submit Login Form
    Then Verify Invalid Password Error


TC_003 — Login With Wrong Username
    [Documentation]    Verify that an error message is displayed when login is attempted with an incorrect username
    [Tags]             login    negative

    When Enter Credentials With Wrong Username
    And Submit Login Form
    Then Verify Invalid Username Error


TC_004 — Logout After Successful Login
    [Documentation]    Verify that a user can log out after a successful login and is redirected to the login page
    [Tags]             logout    positive

    And Enter Valid Credentials
    And Submit Login Form
    And Verify Successful Login
    When Logout From Secure Area
    Then Verify Successful Logout