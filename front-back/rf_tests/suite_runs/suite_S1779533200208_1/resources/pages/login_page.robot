*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Login
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message Displayed
    Wait Until Page Contains Element    ${SUCCESS_MESSAGE}    timeout=5s
    Page Should Contain    You logged into a secure area!

Verify Invalid Password Error Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_INVALID_PASSWORD}    timeout=5s
    Page Should Contain    Your password is invalid!

Verify Invalid Username Error Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_INVALID_USERNAME}    timeout=5s
    Page Should Contain    Your username is invalid!

Verify Login Page Displayed
    Location Should Be    ${LOGIN_PAGE_URL}