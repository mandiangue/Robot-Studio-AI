*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Login test cases for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Click On Login Button
    Then User Should Be Redirected To Secure Page
    And Success Message Should Be Displayed

TC_002 — Failed Login With Incorrect Password

    When Enter Credentials With Wrong Password
    And Click On Login Button
    Then User Should Stay On Login Page
    And Invalid Password Message Should Be Displayed In Red

TC_003 — Failed Login With Incorrect Username

    When Enter Credentials With Wrong Username
    And Click On Login Button
    Then User Should Stay On Login Page
    And Invalid Username Message Should Be Displayed In Red