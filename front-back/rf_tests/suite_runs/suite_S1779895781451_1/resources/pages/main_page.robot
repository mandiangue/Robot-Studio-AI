*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
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
    Clear Element Text    ${USERNAME_FIELD}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Clear Element Text    ${PASSWORD_FIELD}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message
    Element Should Contain    ${FLASH_MESSAGE}    ${SUCCESS_MESSAGE}

Verify Invalid Password Message
    Element Should Contain    ${FLASH_MESSAGE}    ${INVALID_PASSWORD_MSG}

Verify Invalid Username Message
    Element Should Contain    ${FLASH_MESSAGE}    ${INVALID_USERNAME_MSG}

Verify Logout Message
    Element Should Contain    ${FLASH_MESSAGE}    ${LOGOUT_MESSAGE}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Verify Redirect To Login Page
    Location Should Contain    /login