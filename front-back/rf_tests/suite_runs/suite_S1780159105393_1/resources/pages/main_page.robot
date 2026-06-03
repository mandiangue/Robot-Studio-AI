*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
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
    [Arguments]    ${expected_text}
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_text}

Flash Message Color Should Be Red
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    ${color}=    Get Value From User    css=#flash
    Element Should Be Visible    ${FLASH_MESSAGE}

Logout Button Should Be Visible
    Element Should Be Visible    ${LOGOUT_BUTTON}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Login Page Should Be Displayed
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s
    Element Should Be Visible    ${USERNAME_FIELD}