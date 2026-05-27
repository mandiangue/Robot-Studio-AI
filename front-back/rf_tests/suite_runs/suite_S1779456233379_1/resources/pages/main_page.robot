*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message Displayed
    Wait Until Element Is Visible    ${SUCCESS_MESSAGE}    timeout=10s
    Element Should Be Visible    ${SUCCESS_MESSAGE}

Verify Invalid Password Error Message Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE_INVALID_PASSWORD}    timeout=10s
    Element Should Be Visible    ${ERROR_MESSAGE_INVALID_PASSWORD}

Verify Invalid Username Error Message Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE_INVALID_USERNAME}    timeout=10s
    Element Should Be Visible    ${ERROR_MESSAGE_INVALID_USERNAME}

Verify User Is On Login Page
    Title Should Be    ${PAGE_TITLE}
    Element Should Be Visible    ${USERNAME_INPUT}
    Element Should Be Visible    ${PASSWORD_INPUT}