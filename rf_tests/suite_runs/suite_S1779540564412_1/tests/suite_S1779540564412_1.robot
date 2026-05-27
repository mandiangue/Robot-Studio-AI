*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Suite for Login Functionality
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540564412_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540564412_1/resources/keywords.robot

*** Test Cases ***
TC_001 Login With Valid Credentials

    When User Enters Valid Credentials
    And User Clicks Login Button
    Then User Should See Success Message


TC_002 Login With Invalid Password

    When User Enters Valid Username And Invalid Password
    And User Clicks Login Button
    Then User Should See Password Error Message
    And User Should Remain On Login Page


TC_003 Login With Invalid Username

    When User Enters Invalid Username And Valid Password
    And User Clicks Login Button
    Then User Should See Username Error Message
    And User Should Remain On Login Page