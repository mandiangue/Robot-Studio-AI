*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Login Page Object
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Wait Until Page Contains Element    ${LOGIN_BUTTON}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Login Page Is Displayed
    Page Should Contain Element    ${LOGIN_BUTTON}
    Page Should Contain Element    ${USERNAME_FIELD}
    Page Should Contain Element    ${PASSWORD_FIELD}