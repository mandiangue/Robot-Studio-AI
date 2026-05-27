*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Login test suite for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Submit Login Form
    Then Verify Successful Login

TC_002 — Failed Login With Incorrect Password

    When Enter Invalid Password Credentials
    And Submit Login Form
    Then Verify Invalid Password Error

TC_003 — Failed Login With Incorrect Username

    When Enter Invalid Username Credentials
    And Submit Login Form
    Then Verify Invalid Username Error