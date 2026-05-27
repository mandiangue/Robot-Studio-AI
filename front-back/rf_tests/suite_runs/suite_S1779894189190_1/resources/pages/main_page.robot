*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Clear Element Text    ${USERNAME_FIELD}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Clear Element Text    ${PASSWORD_FIELD}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Element    ${LOGIN_BUTTON}

Get Flash Message Text
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    ${text}=    Get Text    ${FLASH_MESSAGE}
    [Return]    ${text}

Flash Message Should Contain
    [Arguments]    ${expected_text}
    ${text}=    Get Flash Message Text
    Should Contain    ${text}    ${expected_text}

Flash Message Color Should Be Red
    ${color}=    Get Element Attribute    ${FLASH_MESSAGE}    class
    Should Contain    ${color}    error

Click Logout Button
    Wait Until Element Is Visible    ${LOGOUT_BUTTON}    timeout=10s
    Click Element    ${LOGOUT_BUTTON}