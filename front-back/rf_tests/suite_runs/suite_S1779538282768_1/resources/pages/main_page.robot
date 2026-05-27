*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***

Open Login Page

    Maximize Browser Window
    Wait Until Page Contains Element    ${LOGIN_BUTTON}    timeout=10s

Input Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Input Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Get Alert Message
    Wait Until Page Contains Element    ${ALERT_MESSAGE}    timeout=10s
    ${message}=    Get Text    ${ALERT_MESSAGE}
    [Return]    ${message}

Close Browser Session


Verify Success Message Is Displayed
    Wait Until Page Contains    ${SUCCESS_MESSAGE}    timeout=10s
    Page Should Contain    ${SUCCESS_MESSAGE}

Verify Error Message Contains Text
    [Arguments]    ${expected_text}
    ${alert_text}=    Get Alert Message
    Should Contain    ${alert_text}    ${expected_text}

Verify User Remains On Login Page
    Wait Until Page Contains Element    ${LOGIN_BUTTON}    timeout=10s
    Page Should Contain Element    ${USERNAME_FIELD}
    Page Should Contain Element    ${PASSWORD_FIELD}