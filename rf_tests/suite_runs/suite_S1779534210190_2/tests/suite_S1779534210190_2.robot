*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_2/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials

    When User Enters Valid Username And Valid Password
    Then User Should See Success Message


TC_002 Failed Login With Invalid Password

    When User Enters Valid Username And Invalid Password
    Then User Should See Invalid Password Error


TC_003 Failed Login With Invalid Username

    When User Enters Invalid Username And Valid Password
    Then User Should See Invalid Username Error