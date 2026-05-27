*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Application Test Cases
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials

    When User Enters Valid Credentials
    Then User Should See Success Message
    And User Should See Logout Button


TC_002 Failed Login With Invalid Password

    When User Enters Valid Username And Invalid Password
    Then User Should Remain On Login Page
    And User Should See Invalid Password Error Message


TC_003 Failed Login With Invalid Username

    When User Enters Invalid Username And Valid Password
    Then User Should Remain On Login Page
    And User Should See Invalid Username Error Message
