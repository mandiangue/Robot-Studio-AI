*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for the Login Page
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

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
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_text}

Flash Message Should Be Red
    ${color}=    Get Element Attribute    ${FLASH_MESSAGE}    style
    Should Contain    ${color}    color

User Should Be On Secure Page
    Wait Until Location Contains    secure    timeout=10s
    Wait Until Element Is Visible    ${FLASH_MESSAGE}    timeout=10s
    Element Should Contain    ${FLASH_MESSAGE}    ${SUCCESS_MESSAGE}

User Should Stay On Login Page
    Location Should Be    ${BASE_URL}

Close Login Page