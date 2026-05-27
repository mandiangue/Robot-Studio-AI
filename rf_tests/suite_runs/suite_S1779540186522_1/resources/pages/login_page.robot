*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Login
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message Displayed
    Wait Until Element Is Visible    ${SUCCESS_MESSAGE}    timeout=10s

Verify Invalid Password Error Displayed
    Wait Until Element Is Visible    ${ERROR_INVALID_PASSWORD}    timeout=10s

Verify Invalid Username Error Displayed
    Wait Until Element Is Visible    ${ERROR_INVALID_USERNAME}    timeout=10s

Verify Login Page Is Displayed
    Wait Until Element Is Visible    ${LOGIN_BUTTON}    timeout=10s