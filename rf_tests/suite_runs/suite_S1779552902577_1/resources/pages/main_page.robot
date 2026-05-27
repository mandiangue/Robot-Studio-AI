*** Settings ***
Suite Setup       Open Browser No Popup    ${LOCATOR_LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for the Login Page of the-internet.herokuapp.com
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Title Should Be    The Internet

Enter Username
    [Arguments]    ${username}
    Input Text    ${LOCATOR_USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${LOCATOR_PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${LOCATOR_LOGIN_BUTTON}

Flash Message Should Contain
    [Arguments]    ${expected_text}
    Element Should Contain    ${LOCATOR_FLASH_MESSAGE}    ${expected_text}

Flash Message Should Be Displayed In Red
    ${color}=    Get Element CSS Value    ${LOCATOR_FLASH_MESSAGE}    background-color
    Should Be Equal As Strings    ${color}    ${FLASH_ERROR_COLOR}

User Should Be On Secure Page
    Location Should Contain    /secure
    Title Should Be    The Internet

User Should Remain On Login Page
    Location Should Contain    /login

Close Login Page