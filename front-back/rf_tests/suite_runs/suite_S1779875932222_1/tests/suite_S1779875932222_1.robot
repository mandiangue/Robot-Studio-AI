*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests for the-internet.herokuapp.com login functionality
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779875932222_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779875932222_1/resources/keywords.robot



*** Test Cases ***
TC_001 - Successful Login With Valid Credentials

    When Login With Valid Credentials
    Then Verify Successful Login

TC_002 - Failed Login With Wrong Password

    When Login With Wrong Password
    Then Verify Failed Login With Wrong Password

TC_003 - Failed Login With Wrong Username

    When Login With Wrong Username
    Then Verify Failed Login With Wrong Username

TC_004 - Logout After Successful Login

    And Login With Valid Credentials
    And Verify Successful Login
    When Perform Logout
    Then Verify Successful Logout