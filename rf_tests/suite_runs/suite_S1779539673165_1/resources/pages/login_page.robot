*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Model for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Wait Until Page Contains Element    ${USERNAME_FIELD}    timeout=10s

Close Login Page


Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message Is Displayed
    Wait Until Page Contains Element    ${SUCCESS_MESSAGE}    timeout=10s

Verify Error Message Password Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_PASSWORD}    timeout=10s

Verify Error Message Username Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_USERNAME}    timeout=10s

Verify User Is On Login Page
    Location Should Be    ${BASE_URL}

Verify User Is On Secure Area
    Location Should Be    ${SECURE_AREA_URL}