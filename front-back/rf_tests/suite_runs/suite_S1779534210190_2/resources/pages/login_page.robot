*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Login
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Wait Until Page Contains    Login Page

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Get Alert Message
    Wait Until Element Is Visible    ${ALERT_MESSAGE}    timeout=5
    ${message}    Get Text    ${ALERT_MESSAGE}
    [Return]    ${message}

Close Browser Session