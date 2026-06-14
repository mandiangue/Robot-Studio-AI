*** Settings ***
Documentation    Page Object for the login application
Library          Browser
Resource         ../variables.robot

*** Variables ***
${USERNAME_INPUT}    id=username
${PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}      css=button[type="submit"]
${LOGOUT_BUTTON}     css=a[href="/logout"]
${FLASH_MESSAGE}     id=flash

*** Keywords ***
Go To Login Page
    Go To    ${BASE_URL}
    Wait For Elements State    ${USERNAME_INPUT}    visible    timeout=10s

Enter Username
    [Arguments]    ${username}
    Fill Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Fill Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click    ${LOGIN_BUTTON}

Click Logout Button
    Wait For Elements State    ${LOGOUT_BUTTON}    visible    timeout=10s
    Click    ${LOGOUT_BUTTON}

Verify Flash Message Contains
    [Arguments]    ${expected_text}
    Wait For Elements State    ${FLASH_MESSAGE}    visible    timeout=10s
    ${actual}=    Get Text    ${FLASH_MESSAGE}
    Should Contain    ${actual}    ${expected_text}


