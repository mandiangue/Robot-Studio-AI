*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Test suite for login and logout scenarios on the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Login With Valid Credentials
    [Documentation]    Access the login URL, enter valid credentials and verify redirection to secure area
    [Tags]    login    valid

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Successful Login

TC_002 — Login With Incorrect Password
    [Documentation]    Access the login URL, enter valid username with wrong password and verify error message
    [Tags]    login    invalid    password

    When Enter Valid Username With Wrong Password
    And Submit Login Form
    Then Verify Invalid Password Error

TC_003 — Login With Incorrect Username
    [Documentation]    Access the login URL, enter wrong username with valid password and verify error message
    [Tags]    login    invalid    username

    When Enter Wrong Username With Valid Password
    And Submit Login Form
    Then Verify Invalid Username Error

TC_004 — Logout After Successful Login
    [Documentation]    Login successfully then click Logout and verify redirection to login page with logout message
    [Tags]    logout    valid

    And Enter Valid Credentials
    And Submit Login Form
    And Verify Successful Login
    When Logout From Secure Area
    Then Verify Successful Logout