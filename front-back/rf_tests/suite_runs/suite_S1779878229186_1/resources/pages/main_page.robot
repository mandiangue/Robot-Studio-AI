*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Title Should Be    The Internet

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Flash Message Should Contain
    [Arguments]    ${message}
    Element Should Contain    ${FLASH_MSG}    ${message}

Flash Message Should Be Displayed In Red
    [Arguments]    ${message}
    Element Should Contain    ${FLASH_MSG}    ${message}
    ${color}=    Get Element Attribute    ${FLASH_MSG}    class
    Should Contain    ${color}    error

User Should Be On Secure Page
    Location Should Contain    /secure
    Element Should Contain    ${FLASH_MSG}    ${SUCCESS_MSG}

User Should Be On Login Page
    Location Should Be    ${BASE_URL}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}