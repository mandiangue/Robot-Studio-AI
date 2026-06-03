*** Settings ***
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page
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
    Click Button    ${LOGIN_BUTTON}

Get Flash Message Text
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    ${text}=    Get Text    ${FLASH_MSG}
    [Return]    ${text}

Get Flash Message Color
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    ${color}=    Get Value Of Css Property    ${FLASH_MSG}    background-color
    [Return]    ${color}

Click Logout Button
    Wait Until Element Is Visible    ${LOGOUT_BUTTON}    timeout=10s
    Click Element    ${LOGOUT_BUTTON}

Verify Secure Page Is Displayed
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    Element Should Contain    ${FLASH_MSG}    ${SUCCESS_MSG}

Verify Still On Login Page
    Location Should Contain    /login