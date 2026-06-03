*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Tests — Login scenarios for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780048980605_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780048980605_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    Given Navigate To Login Page
    When Login With Valid Credentials
    Then Verify Successful Login

TC_002 — Failed Login With Wrong Password
    Given Navigate To Login Page
    When Login With Wrong Password
    Then Verify Invalid Password Error

TC_003 — Failed Login With Wrong Username
    Given Navigate To Login Page
    When Login With Wrong Username
    Then Verify Invalid Username Error

TC_004 — Logout After Successful Login
    Given Navigate To Login Page
    And Login With Valid Credentials
    And Verify Successful Login
    When Perform Logout
    Then Verify Successful Logout