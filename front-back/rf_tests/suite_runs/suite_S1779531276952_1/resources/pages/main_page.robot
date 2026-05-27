*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Input Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Input Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Welcome Message Is Displayed
    Wait Until Page Contains Element    ${WELCOME_MESSAGE}    timeout=10s
    Element Should Be Visible    ${WELCOME_MESSAGE}

Verify Logout Button Is Displayed
    Element Should Be Visible    ${LOGOUT_BUTTON}

Verify Error Message Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE}    timeout=10s
    Element Should Be Visible    ${ERROR_MESSAGE}

Verify Error Message Contains Invalid Credentials Text
    Element Should Contain    ${ERROR_MESSAGE}    Your username is invalid!

Verify User Remains On Login Page
    Wait Until Page Contains Element    ${USERNAME_FIELD}    timeout=10s
    Element Should Be Visible    ${USERNAME_FIELD}