*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Wait Until Page Contains    Login Page

Close Browser Session


Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message Is Displayed
    Wait Until Page Contains Element    ${SUCCESS_MESSAGE}    timeout=5s
    Page Should Contain    You logged into a secure area!

Verify Error Password Message Is Displayed
    Wait Until Page Contains Element    ${ERROR_PASSWORD_MESSAGE}    timeout=5s
    Page Should Contain    Your password is invalid!

Verify Error Username Message Is Displayed
    Wait Until Page Contains Element    ${ERROR_USERNAME_MESSAGE}    timeout=5s
    Page Should Contain    Your username is invalid!

Verify User Is On Secure Page
    Wait Until Location Contains    /secure    timeout=5s
    Location Should Contain    /secure

Verify User Is On Login Page
    Location Should Contain    /login

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Verify Logout Message Is Displayed
    Wait Until Page Contains Element    ${LOGOUT_MESSAGE}    timeout=5s
    Page Should Contain    You logged out of the secure area!