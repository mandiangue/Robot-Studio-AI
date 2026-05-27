*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for the Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Clear Element Text    ${USERNAME_FIELD}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Clear Element Text    ${PASSWORD_FIELD}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Successful Login
    Wait Until Location Is    ${SECURE_URL}    timeout=10s
    Wait Until Element Is Visible    ${SUCCESS_MESSAGE}    timeout=10s
    Element Should Contain    ${SUCCESS_MESSAGE}    ${EXPECTED_SUCCESS_TEXT}

Verify Invalid Password Error
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Contain    ${ERROR_MESSAGE}    ${EXPECTED_INVALID_PASSWORD_TEXT}
    Element Should Be Visible    ${ERROR_MESSAGE}

Verify Invalid Username Error
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Contain    ${ERROR_MESSAGE}    ${EXPECTED_INVALID_USERNAME_TEXT}
    Element Should Be Visible    ${ERROR_MESSAGE}

Close Login Page