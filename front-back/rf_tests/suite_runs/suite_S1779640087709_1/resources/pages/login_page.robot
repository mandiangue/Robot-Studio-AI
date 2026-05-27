*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON_LOCATOR}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Wait Until Page Contains    Login Page

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD_LOCATOR}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD_LOCATOR}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON_LOCATOR}

Get Message Text
    ${message}=    Get Text    ${SUCCESS_MESSAGE_LOCATOR}
    [Return]    ${message}

Verify Success Message Displayed
    Wait Until Page Contains    ${SUCCESS_TEXT}
    Page Should Contain    ${SUCCESS_TEXT}

Verify Error Message For Invalid Password
    Wait Until Page Contains    ${ERROR_INVALID_PASSWORD}
    Page Should Contain    ${ERROR_INVALID_PASSWORD}

Verify Error Message For Invalid Username
    Wait Until Page Contains    ${ERROR_INVALID_USERNAME}
    Page Should Contain    ${ERROR_INVALID_USERNAME}

Verify User On Secure Area
    Wait Until Location Is    ${SECURE_AREA_URL}
    Location Should Be    ${SECURE_AREA_URL}

Verify User On Login Page
    Wait Until Location Is    ${LOGIN_URL}
    Location Should Be    ${LOGIN_URL}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON_LOCATOR}

Verify Logout Message Displayed
    Wait Until Page Contains    ${LOGOUT_MESSAGE}
    Page Should Contain    ${LOGOUT_MESSAGE}

Close Browser Session