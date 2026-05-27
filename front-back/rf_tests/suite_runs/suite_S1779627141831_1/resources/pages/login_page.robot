*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for the Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Title Should Be    The Internet

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Flash Message Should Contain
    [Arguments]    ${expected_text}
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_text}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Close Login Page