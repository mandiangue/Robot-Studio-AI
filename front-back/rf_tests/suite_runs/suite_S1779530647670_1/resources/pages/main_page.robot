*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON_XPATH}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Model for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Wait Until Page Contains Element    ${USERNAME_FIELD_ID}

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD_ID}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD_ID}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON_XPATH}

Verify Success Message Is Displayed
    Wait Until Page Contains Element    ${SUCCESS_MESSAGE_XPATH}
    Page Should Contain    ${SUCCESS_MESSAGE}

Verify Error Message Password Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_XPATH}
    Page Should Contain    ${ERROR_MESSAGE_PASSWORD}

Verify Error Message Username Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_XPATH}
    Page Should Contain    ${ERROR_MESSAGE_USERNAME}

Verify User Is On Secure Page
    Wait Until Location Is    ${SECURE_URL}

Verify User Remains On Login Page
    Wait Until Location Is    ${LOGIN_URL}

Close Browser Session