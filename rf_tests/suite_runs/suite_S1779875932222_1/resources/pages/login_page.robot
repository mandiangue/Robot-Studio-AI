*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${BASE_URL}

Enter Username
    [Arguments]    ${username}
    Input Text    ${INPUT_USER}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${INPUT_PASS}    ${password}

Click Login Button
    Click Button    ${BTN_LOGIN}

Verify Success Message
    Element Should Be Visible    ${MSG_SUCCESS}
    Element Should Contain       ${MSG_SUCCESS}    You logged into a secure area!

Verify Invalid Password Message
    Element Should Be Visible    ${MSG_ERROR}
    Element Should Contain       ${MSG_ERROR}    Your password is invalid!

Verify Invalid Username Message
    Element Should Be Visible    ${MSG_ERROR}
    Element Should Contain       ${MSG_ERROR}    Your username is invalid!

Click Logout Button
    Click Element    ${BTN_LOGOUT}

Verify Logout Message
    Element Should Be Visible    ${MSG_LOGOUT}
    Element Should Contain       ${MSG_LOGOUT}    You logged out of the secure area!

Verify User Is On Login Page
    Location Should Contain    /login