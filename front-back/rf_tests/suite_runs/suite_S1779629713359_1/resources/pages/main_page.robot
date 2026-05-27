*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_TITLE}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for Login and Secure Area pages
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Title Should Be    ${LOGIN_TITLE}

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Successful Login Message
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain           ${FLASH_MESSAGE}    You logged into a secure area!
    Title Should Be                  ${SECURE_TITLE}

Verify Invalid Password Message
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain           ${FLASH_MESSAGE}    Your password is invalid!
    ${color}=    Get Value           ${FLASH_MESSAGE}
    Element Should Be Visible        ${FLASH_MESSAGE}

Verify Invalid Username Message
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain           ${FLASH_MESSAGE}    Your username is invalid!
    Element Should Be Visible        ${FLASH_MESSAGE}

Click Logout Button
    Wait Until Element Is Visible    ${LOGOUT_BUTTON}    timeout=10s
    Click Link                       ${LOGOUT_BUTTON}

Verify Successful Logout Message
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain           ${FLASH_MESSAGE}    You logged out of the secure area!
    Title Should Be                  ${LOGIN_TITLE}

Close Login Page