*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Title Should Be    The Internet

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Success Message
    Element Should Contain    ${FLASH_MESSAGE}    You logged into a secure area!

Verify Invalid Password Message
    Element Should Contain    ${FLASH_MESSAGE}    Your password is invalid!

Verify Invalid Username Message
    Element Should Contain    ${FLASH_MESSAGE}    Your username is invalid!

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Verify Logout Message
    Element Should Contain    ${FLASH_MESSAGE}    You logged out of the secure area!

Verify Login Page Is Displayed
    Title Should Be    The Internet