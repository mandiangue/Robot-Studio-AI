*** Settings ***
Documentation    Page Object for the login application (ALL selectors here)
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Fill Username Field
    [Arguments]    ${username}
    Input Text    id=username    ${username}

Fill Password Field
    [Arguments]    ${password}
    Input Text    id=password    ${password}

Submit Login Form
    Click Button    css=button[type="submit"]

Login Page Should Be Displayed
    Location Should Contain    /login
    Page Should Contain Element    id=username
    Page Should Contain Element    id=password

Secure Page Should Be Displayed
    Location Should Contain    /secure
    Page Should Contain    You logged into a secure area!
    Page Should Contain Element    css=a.button.secondary.radius

Error Message Should Contain
    [Arguments]    ${message}
    Wait Until Page Contains    ${message}    timeout=10s

Logout Button Should Be Visible
    Page Should Contain Element    css=a.button.secondary.radius