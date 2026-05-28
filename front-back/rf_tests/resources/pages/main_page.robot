*** Settings ***
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

Verify Successful Login
    Location Should Be    ${SECURE_URL}
    Element Should Contain    ${FLASH_MESSAGE}    You logged into a secure area!

Verify Invalid Password Error
    Location Should Be    ${BASE_URL}
    Element Should Contain    ${FLASH_MESSAGE}    Your password is invalid!
    Element Should Be Visible    ${FLASH_MESSAGE}

Verify Invalid Username Error
    Location Should Be    ${BASE_URL}
    Element Should Contain    ${FLASH_MESSAGE}    Your username is invalid!
    Element Should Be Visible    ${FLASH_MESSAGE}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Verify Successful Logout
    Location Should Be    ${BASE_URL}
    Element Should Contain    ${FLASH_MESSAGE}    You logged out of the secure area!