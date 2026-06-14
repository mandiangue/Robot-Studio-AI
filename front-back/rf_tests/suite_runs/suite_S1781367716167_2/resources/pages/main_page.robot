*** Settings ***
Documentation    Page Object for the application (ALL selectors here)
Library          Browser
Resource         ../variables.robot

*** Variables ***
${USERNAME_INPUT}    id=username
${PASSWORD_INPUT}    id=password
${LOGIN_BUTTON}      css=button[type="submit"]
${LOGOUT_BUTTON}     css=a.button.secondary
${FLASH_MESSAGE}     id=flash

*** Keywords ***
Enter Username
    [Arguments]    ${username}
    Wait For Elements State    ${USERNAME_INPUT}    visible    timeout=10s
    Fill Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Wait For Elements State    ${PASSWORD_INPUT}    visible    timeout=10s
    Fill Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Wait For Elements State    ${LOGIN_BUTTON}    visible    timeout=10s
    Click    ${LOGIN_BUTTON}

Click Logout Button
    Wait For Elements State    ${LOGOUT_BUTTON}    visible    timeout=10s
    Click    ${LOGOUT_BUTTON}

Verify Flash Message Contains
    [Arguments]    ${expected_text}
    Wait For Elements State    ${FLASH_MESSAGE}    visible    timeout=10s
    ${actual}=    Get Text    ${FLASH_MESSAGE}
    Should Contain    ${actual}    ${expected_text}


