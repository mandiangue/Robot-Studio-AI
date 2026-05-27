*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object — Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
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

Verify Success Message Is Displayed
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    Element Should Contain    ${FLASH_MSG}    ${SUCCESS_MSG}

Verify Error Message Password Is Displayed
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    Element Should Contain    ${FLASH_MSG}    ${ERROR_PASSWORD_MSG}
    Element Should Be Visible    ${FLASH_MSG}

Verify Error Message Username Is Displayed
    Wait Until Element Is Visible    ${FLASH_MSG}    timeout=10s
    Element Should Contain    ${FLASH_MSG}    ${ERROR_USERNAME_MSG}
    Element Should Be Visible    ${FLASH_MSG}

Close Login Page