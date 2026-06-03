*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object - Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}

Enter Username
    [Arguments]    ${username}
    Input Text    ${INPUT_USER}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${INPUT_PASS}    ${password}

Click Login Button
    Click Button    ${BTN_LOGIN}

Click Logout Button
    Click Element    ${BTN_LOGOUT}

Flash Message Should Contain
    [Arguments]    ${expected_text}
    Element Should Contain    ${FLASH_MSG}    ${expected_text}

Flash Message Color Should Be Red
    ${color}=    Get Css Value    ${FLASH_MSG}    background-color
    Should Not Be Empty    ${color}

User Should Be On Secure Page
    Location Should Contain    secure

User Should Be On Login Page
    Location Should Contain    login