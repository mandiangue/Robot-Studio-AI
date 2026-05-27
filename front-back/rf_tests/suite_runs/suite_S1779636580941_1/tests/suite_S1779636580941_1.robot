*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
Suite Teardown    Close Browser
Documentation    Login Test Suite for the-internet.herokuapp.com
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779636580941_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779636580941_1/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Click Login Button
    Then User Is Redirected To Secure Area
    And Success Message Is Displayed


TC_002 Failed Login With Incorrect Password

    When Enter Invalid Password
    And Click Login Button
    Then User Remains On Login Page
    And Error Password Message Is Displayed


TC_003 Failed Login With Incorrect Username

    When Enter Invalid Username
    And Click Login Button
    Then User Remains On Login Page
    And Error Username Message Is Displayed


TC_004 Logout After Successful Login
    Given User Is Logged In With Valid Credentials
    When Click Logout Button
    Then User Is Redirected To Login Page
    And Logout Message Is Displayed