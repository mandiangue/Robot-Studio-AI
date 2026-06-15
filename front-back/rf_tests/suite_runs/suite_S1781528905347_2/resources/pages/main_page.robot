*** Settings ***
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${LOGIN_URL}
    Wait Until Element Is Visible    ${USERNAME_INPUT}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Element    ${LOGIN_BUTTON}

Click Logout Button
    Wait Until Element Is Visible    ${LOGOUT_BUTTON}    timeout=10s
    Click Element    ${LOGOUT_BUTTON}

Verify Current Url Contains
    [Arguments]    ${expected}
    Location Should Contain    ${expected}

Verify Flash Message Contains
    [Arguments]    ${expected_message}
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    ${text}=    Get Text    ${FLASH_MESSAGE}
    Should Contain    ${text}    ${expected_message}