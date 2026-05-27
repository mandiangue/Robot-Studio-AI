*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Application Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_1/resources/keywords.robot

*** Test Cases ***
TC_001 Successful Login With Valid Credentials
    [Documentation]    Test successful login with valid username and password
    Login With Valid Credentials
    Verify Successful Login
    Teardown Login Test

TC_002 Failed Login With Incorrect Password
    [Documentation]    Test failed login with correct username but incorrect password
    Login With Invalid Password
    Verify Failed Login With Invalid Password
    Teardown Login Test

TC_003 Failed Login With Incorrect Username
    [Documentation]    Test failed login with incorrect username but correct password
    Login With Invalid Username
    Verify Failed Login With Invalid Username
    Teardown Login Test

TC_004 Logout After Successful Login
    [Documentation]    Test successful logout after logging into secure area
    Login And Navigate To Secure Area
    Logout From Secure Area
    Verify Successful Logout
    Teardown Login Test