*** Settings ***
Suite Setup       Go To    ${LOGIN_USERNAME_FIELD}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Enter Username
    [Arguments]    ${username}
    Input Text    ${LOGIN_USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${LOGIN_PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Error Message Is Displayed
    Element Should Be Visible    ${ERROR_MESSAGE}