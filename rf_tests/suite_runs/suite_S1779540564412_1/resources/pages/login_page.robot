*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Wait Until Page Contains    Login Page

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message Is Displayed
    Wait Until Page Contains Element    ${SUCCESS_MESSAGE}    timeout=10
    Page Should Contain    You logged into a secure area!

Verify Error Password Message Is Displayed
    Wait Until Page Contains Element    ${ERROR_PASSWORD_MESSAGE}    timeout=10
    Page Should Contain    Your password is invalid!

Verify Error Username Message Is Displayed
    Wait Until Page Contains Element    ${ERROR_USERNAME_MESSAGE}    timeout=10
    Page Should Contain    Your username is invalid!

Verify User Remains On Login Page
    Wait Until Page Contains    Login Page    timeout=10