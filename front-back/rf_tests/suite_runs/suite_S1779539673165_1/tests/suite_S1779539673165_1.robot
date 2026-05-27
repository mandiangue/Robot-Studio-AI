*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Test Cases
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779539673165_1/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials

    When Enter Valid Credentials
    And Click Login
    Then User Should See Success Message


TC_002 Failed Login With Invalid Password

    When Enter Invalid Password With Valid Username
    And Click Login
    Then User Should See Invalid Password Error


TC_003 Failed Login With Invalid Username

    When Enter Invalid Username With Valid Password
    And Click Login
    Then User Should See Invalid Username Error