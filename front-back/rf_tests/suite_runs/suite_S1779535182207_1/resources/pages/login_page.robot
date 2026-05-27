*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON_SELECTOR}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Login
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Enter Username In Login Form
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD_SELECTOR}    ${username}

Enter Password In Login Form
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD_SELECTOR}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON_SELECTOR}

Verify Success Message Is Displayed
    Wait Until Page Contains Element    ${SUCCESS_MESSAGE_SELECTOR}    timeout=5s

Verify Invalid Password Error Message Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_INVALID_PASSWORD_SELECTOR}    timeout=5s

Verify Invalid Username Error Message Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_INVALID_USERNAME_SELECTOR}    timeout=5s

Verify User Is On Login Page
    Wait Until Page Contains Element    ${USERNAME_FIELD_SELECTOR}    timeout=5s