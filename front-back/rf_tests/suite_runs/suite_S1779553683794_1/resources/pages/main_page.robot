*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for the Login Page of the-internet.herokuapp.com
Library          SeleniumLibrary
Resource         ../variables.robot

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

Flash Message Should Contain Success
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain          ${FLASH_MESSAGE}    ${SUCCESS_MSG}
    Page Should Contain Element     ${FLASH_SUCCESS}

Flash Message Should Contain Invalid Password Error
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain          ${FLASH_MESSAGE}    ${INVALID_PWD_MSG}
    Page Should Contain Element     ${FLASH_ERROR}

Flash Message Should Contain Invalid Username Error
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain          ${FLASH_MESSAGE}    ${INVALID_USR_MSG}
    Page Should Contain Element     ${FLASH_ERROR}

User Should Be On Secure Page
    Location Should Be    ${SECURE_URL}

User Should Remain On Login Page
    Location Should Be    ${BASE_URL}

Close Login Page