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

Flash Message Should Contain
    [Arguments]    ${expected_text}
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_text}

Flash Message Should Be Red
    ${color}=    Get Value From User    ${FLASH_MESSAGE}
    Element Should Contain    ${FLASH_MESSAGE}    ${expected_text}

Click Logout Button
    Click Element    ${LOGOUT_BUTTON}

Verify Flash Message Color Is Red
    ${element}=    Get WebElement    ${FLASH_MESSAGE}
    ${class}=      Get Element Attribute    ${element}    class
    Should Contain    ${class}    error