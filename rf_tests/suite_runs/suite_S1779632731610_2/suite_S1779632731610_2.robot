*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test suite for login and logout scenarios on the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Verify that a user can log in successfully with valid credentials
    [Tags]             login    positive

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Successful Login

TC_002 — Failed Login With Incorrect Password
    [Documentation]    Verify that login fails when an incorrect password is provided
    [Tags]             login    negative

    When Enter Credentials With Wrong Password
    And Submit Login Form
    Then Verify Login Failed With Invalid Password

TC_003 — Failed Login With Incorrect Username
    [Documentation]    Verify that login fails when an incorrect username is provided
    [Tags]             login    negative

    When Enter Credentials With Wrong Username
    And Submit Login Form
    Then Verify Login Failed With Invalid Username

TC_004 — Successful Logout After Login
    [Documentation]    Verify that a user can log out after a successful login
    [Tags]             logout    positive

    And Enter Valid Credentials
    And Submit Login Form
    And Verify Successful Login
    When Perform Logout
    Then Verify Successful Logout