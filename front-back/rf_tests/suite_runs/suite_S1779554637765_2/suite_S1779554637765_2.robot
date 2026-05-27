*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Tests — Login scenarios on the-internet.herokuapp.com
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


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