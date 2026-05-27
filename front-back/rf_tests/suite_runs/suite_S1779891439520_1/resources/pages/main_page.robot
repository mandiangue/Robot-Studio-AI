*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${BASE_URL}
    Title Should Be    The Internet

Enter Username
    [Arguments]    ${username}
    Input Text    ${INPUT_USER}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${INPUT_PASS}    ${password}

Click Login Button
    Click Button    ${BTN_LOGIN}

Verify Successful Login
    Location Should Be    ${SECURE_URL}
    Element Should Contain    ${MSG_FLASH}    ${SUCCESS_LOGIN}

Verify Invalid Password Error
    Element Should Contain    ${MSG_FLASH}    ${ERROR_PASS}
    Element Should Be Visible    ${MSG_FLASH}

Verify Invalid Username Error
    Element Should Contain    ${MSG_FLASH}    ${ERROR_USER}
    Element Should Be Visible    ${MSG_FLASH}

Click Logout Button
    Click Link    ${BTN_LOGOUT}

Verify Successful Logout
    Location Should Be    ${BASE_URL}
    Element Should Contain    ${MSG_FLASH}    ${SUCCESS_LOGOUT}