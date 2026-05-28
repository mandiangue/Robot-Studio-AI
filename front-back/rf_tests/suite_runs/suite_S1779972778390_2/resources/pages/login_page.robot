*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${BASE_URL}

Enter Username
    [Arguments]    ${username}
    Input Text    ${ID_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PW_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BTN}

Get Flash Message Text
    ${text}=    Get Text    ${FLASH_MSG}
    [Return]    ${text}

Click Logout Button
    Click Element    ${LOGOUT_BTN}