*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Flash Message Should Contain
    [Arguments]    ${expected_text}
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_text}

User Should Be On Secure Page
    Location Should Contain    secure

User Should Be On Login Page
    Location Should Contain    login