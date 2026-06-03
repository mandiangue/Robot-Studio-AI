*** Settings ***
Documentation    Page Object Main
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

Verify Successful Login
    Location Should Contain    /secure
    Element Should Contain    ${FLASH_MESSAGE}    You logged into a secure area!

Verify Invalid Username Error
    Element Should Contain    ${FLASH_MESSAGE}    Your username is invalid!
    Location Should Contain    /login

Verify Invalid Password Error
    Element Should Contain    ${FLASH_MESSAGE}    Your password is invalid!
    Location Should Contain    /login

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Verify Successful Logout
    Location Should Contain    /login
    Element Should Contain    ${FLASH_MESSAGE}    You logged out of the secure area!