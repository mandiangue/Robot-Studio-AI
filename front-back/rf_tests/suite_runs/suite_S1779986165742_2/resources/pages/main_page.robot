*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Get Flash Message Text
    ${text}=    Get Text    ${FLASH_MESSAGE}
    [Return]    ${text}

Flash Message Should Contain
    [Arguments]    ${expected_text}
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_text}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}