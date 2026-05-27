*** Settings ***
Suite Setup       Go To    ${SELECTOR_LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Wait Until Page Contains Element    ${SELECTOR_USERNAME_INPUT}

Enter Username
    [Arguments]    ${username}
    Input Text    ${SELECTOR_USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${SELECTOR_PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${SELECTOR_LOGIN_BUTTON}

Get Success Message Text
    Wait Until Page Contains Element    ${SELECTOR_SUCCESS_MESSAGE}
    ${message}=    Get Text    ${SELECTOR_SUCCESS_MESSAGE}
    [Return]    ${message}

Get Error Message Text
    Wait Until Page Contains Element    ${SELECTOR_ERROR_MESSAGE}
    ${message}=    Get Text    ${SELECTOR_ERROR_MESSAGE}
    [Return]    ${message}

Verify User Is On Secure Area
    Wait Until Location Is    ${SECURE_AREA_URL}
    Page Should Contain    Secure Area

Verify User Is Still On Login Page
    Location Should Be    ${LOGIN_PAGE_URL}

Close Login Browser