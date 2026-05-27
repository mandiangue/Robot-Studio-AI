*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Login
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Wait Until Page Contains Element    ${USERNAME_INPUT}

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message Is Displayed
    Wait Until Page Contains Element    ${SUCCESS_MESSAGE}
    Page Should Contain    You logged into a secure area!

Verify Error Message Password Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_PASSWORD}
    Page Should Contain    Your password is invalid!

Verify Error Message Username Is Displayed
    Wait Until Page Contains Element    ${ERROR_MESSAGE_USERNAME}
    Page Should Contain    Your username is invalid!

Close Login Page