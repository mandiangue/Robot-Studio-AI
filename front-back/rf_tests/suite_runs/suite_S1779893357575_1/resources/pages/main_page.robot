*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Title Should Be    The Internet

Enter Username
    [Arguments]    ${username}
    Input Text    ${LOC_USERNAME}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${LOC_PASSWORD}    ${password}

Click Login Button
    Click Button    ${LOC_SUBMIT}

Flash Message Should Contain
    [Arguments]    ${expected_text}
    Element Should Contain    ${LOC_FLASH}    ${expected_text}

Flash Message Should Be Red
    Element Should Be Visible    css=#flash.error

Click Logout Button
    Click Element    ${LOC_LOGOUT}

User Should Be On Secure Page
    Location Should Contain    secure

User Should Be On Login Page
    Location Should Contain    login