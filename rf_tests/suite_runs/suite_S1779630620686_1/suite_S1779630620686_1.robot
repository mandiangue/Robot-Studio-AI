*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Test suite for login and logout scenarios on the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779630620686_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779630620686_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Valid Credentials
    [Documentation]    Verify that a user can log in with valid credentials and sees a success message
    [Tags]             login    valid

    When Enter Valid Credentials
    And Submit The Login Form
    Then Verify Successful Login Message

TC_002 — Login With Incorrect Password
    [Documentation]    Verify that a user cannot log in with an incorrect password and sees an error message
    [Tags]             login    invalid    password

    When Enter Credentials With Wrong Password
    And Submit The Login Form
    Then Verify Invalid Password Message

TC_003 — Login With Incorrect Username
    [Documentation]    Verify that a user cannot log in with an incorrect username and sees an error message
    [Tags]             login    invalid    username

    When Enter Credentials With Wrong Username
    And Submit The Login Form
    Then Verify Invalid Username Message

TC_004 — Logout After Successful Login
    [Documentation]    Verify that a logged-in user can log out and is redirected with a confirmation message
    [Tags]             logout    valid

    And Enter Valid Credentials
    And Submit The Login Form
    And Verify Successful Login Message
    When Perform Logout
    Then Verify Successful Logout Message