*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests Login - the-internet.herokuapp.com
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779895000809_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779895000809_1/resources/keywords.robot



*** Test Cases ***
TC_001 - Successful Login With Valid Credentials
    Given Login With Valid Credentials
    Then Verify Successful Login

TC_002 - Failed Login With Incorrect Password
    Given Login With Invalid Password
    Then Verify Failed Login With Wrong Password

TC_003 - Failed Login With Incorrect Username
    Given Login With Invalid Username
    Then Verify Failed Login With Wrong Username

TC_004 - Logout After Successful Login
    Given Login With Valid Credentials
    And Verify Successful Login
    When Logout From Secure Area