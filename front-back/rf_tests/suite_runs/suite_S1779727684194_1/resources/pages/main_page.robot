*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for Login Page
Library    SeleniumLibrary
Resource    ../variables.robot

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

Verify Success Message Is Displayed
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    You logged into a secure area!

Verify Invalid Password Error Is Displayed
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    Your password is invalid!
    Element Should Be Visible    ${FLASH_MESSAGE}

Verify Invalid Username Error Is Displayed
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    Your username is invalid!
    Element Should Be Visible    ${FLASH_MESSAGE}

Click Logout Button
    Wait Until Element Is Visible    ${LOGOUT_BUTTON}    timeout=10s
    Click Element    ${LOGOUT_BUTTON}

Verify Logout Message Is Displayed
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    You logged out of the secure area!
    Title Should Be    The Internet