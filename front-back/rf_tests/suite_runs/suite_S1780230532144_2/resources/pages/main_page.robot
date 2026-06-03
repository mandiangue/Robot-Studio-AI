*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main - Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Clear Element Text    ${USERNAME_FIELD}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Clear Element Text    ${PASSWORD_FIELD}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Element    ${LOGIN_BUTTON}

Verify Success Message
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    Element Should Contain    ${FLASH_MSG}    You logged into a secure area!

Verify Invalid Password Message
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    Element Should Contain    ${FLASH_MSG}    Your password is invalid!
    Element Should Be Visible    ${FLASH_MSG}

Verify Invalid Username Message
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    Element Should Contain    ${FLASH_MSG}    Your username is invalid!
    Element Should Be Visible    ${FLASH_MSG}

Click Logout Button
    Wait Until Element Is Visible    ${LOGOUT_BUTTON}    timeout=10s
    Click Element    ${LOGOUT_BUTTON}

Verify Logout Message
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    Element Should Contain    ${FLASH_MSG}    You logged out of the secure area!

Verify Login Page Is Displayed
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s
    Element Should Be Visible    ${USERNAME_FIELD}