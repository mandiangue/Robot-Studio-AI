*** Settings ***
Documentation    Page Object for Login Page
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Fill Username
    [Arguments]    ${username}
    Fill Text    id=user-name    ${username}

Fill Password
    [Arguments]    ${password}
    Fill Text    id=password    ${password}

Click Login Button
    Click    css=[data-test="login-button"]

Login Error Message Should Be Visible
    Wait For Elements State    css=[data-test="error"]    visible    timeout=10s

Login Error Should Contain Locked Message
    Get Text    css=[data-test="error"]
