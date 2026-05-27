*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main - Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
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

Flash Message Should Be Red
    Element Should Contain    ${FLASH_MESSAGE}    Your password is invalid!

Flash Message Username Should Be Red
    Element Should Contain    ${FLASH_MESSAGE}    Your username is invalid!

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Secure Page Should Be Displayed
    Location Should Contain    secure
    Element Should Contain    ${FLASH_MESSAGE}    You logged into a secure area!

Login Page Should Be Displayed
    Location Should Contain    login