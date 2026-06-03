*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Title Should Be    The Internet

Enter Username
    [Arguments]    ${username}
    Input Text    ${INPUT_USERNAME}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${INPUT_PASSWORD}    ${password}

Click Login Button
    Click Button    ${BTN_LOGIN}

Flash Message Should Contain
    [Arguments]    ${expected_text}
    Element Should Be Visible    ${MSG_FLASH}
    Element Should Contain       ${MSG_FLASH}    ${expected_text}

Flash Message Color Should Be Red
    ${color}=    Get Element Attribute    ${MSG_FLASH}    class
    Should Contain    ${color}    error

Click Logout Button
    Click Element    ${BTN_LOGOUT}