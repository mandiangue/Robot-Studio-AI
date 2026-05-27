*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test suite for SauceDemo login scenarios
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot


*** Test Cases ***
TC_001 — Successful Login With Valid Credentials
    [Documentation]    Access saucedemo.com, enter username 'standard_user' and password 'secret_sauce',
    ...                click Login and verify the Products page title is visible.
    [Tags]             login    positive

    When Fill In Login Form With Valid Credentials
    And Submit Login Form
    Then Products Page Should Be Displayed

TC_002 — Failed Login With Wrong Password
    [Documentation]    Access saucedemo.com, enter username 'standard_user' and wrong password 'wrong_password',
    ...                click Login and verify an error message is displayed.
    [Tags]             login    negative

    When Fill In Login Form With Wrong Password
    And Submit Login Form
    Then Wrong Password Error Message Should Be Displayed

TC_003 — Failed Login With Locked Out User
    [Documentation]    Access saucedemo.com, enter username 'locked_out_user' and password 'secret_sauce',
    ...                click Login and verify a locked account error message is displayed.
    [Tags]             login    negative

    When Fill In Login Form With Locked User Credentials
    And Submit Login Form
    Then Locked User Error Message Should Be Displayed