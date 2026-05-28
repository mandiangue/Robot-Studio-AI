*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests - Login scenarios for the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779981691714_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779981691714_1/resources/keywords.robot



*** Test Cases ***
TC_001 - Successful Login With Valid Credentials
    Given Navigate To Login Page
    When Login With Valid Credentials
    Then Check Success Message Is Displayed

TC_002 - Failed Login With Wrong Password
    Given Navigate To Login Page
    When Login With Wrong Password
    Then Check Invalid Password Message Is Displayed

TC_003 - Failed Login With Wrong Username
    Given Navigate To Login Page
    When Login With Wrong Username
    Then Check Invalid Username Message Is Displayed

TC_004 - Logout After Successful Login
    Given Navigate To Login Page
    And Login With Valid Credentials
    And Check Success Message Is Displayed
    When Perform Logout
    Then Check Logout Message Is Displayed
    And Check Login Page Is Displayed