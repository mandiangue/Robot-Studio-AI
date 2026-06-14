*** Settings ***
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_INPUT}    10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Element    ${LOGIN_BUTTON}

Click Logout Button
    Wait Until Element Is Visible    ${LOGOUT_BUTTON}    10s
    Click Element    ${LOGOUT_BUTTON}

Verify Flash Message Contains
    [Arguments]    ${expected_message}
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    10s
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_message}