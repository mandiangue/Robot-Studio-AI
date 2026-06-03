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
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message
    Element Should Contain    ${FLASH_MSG}    ${SUCCESS_MSG}

Verify Wrong Password Message
    Element Should Contain    ${FLASH_MSG}    ${WRONG_PWD_MSG}

Verify Wrong Username Message
    Element Should Contain    ${FLASH_MSG}    ${WRONG_USR_MSG}

Verify Logout Message
    Element Should Contain    ${FLASH_MSG}    ${LOGOUT_MSG}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Verify Redirected To Login Page
    Location Should Be    ${BASE_URL}