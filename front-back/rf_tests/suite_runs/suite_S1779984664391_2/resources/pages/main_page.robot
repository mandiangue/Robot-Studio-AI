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

Verify Success Message
    Element Should Contain    ${FLASH_MESSAGE}    You logged into a secure area!

Verify Wrong Password Message
    Element Should Contain    ${FLASH_MESSAGE}    Your password is invalid!

Verify Wrong Username Message
    Element Should Contain    ${FLASH_MESSAGE}    Your username is invalid!

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Verify Logout Message
    Element Should Contain    ${FLASH_MESSAGE}    You logged out of the secure area!

Verify Login Page Is Displayed
    Title Should Be    The Internet