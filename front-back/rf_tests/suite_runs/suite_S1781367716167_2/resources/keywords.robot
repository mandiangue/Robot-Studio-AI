*** Settings ***
Library      Browser
Library      Collections
Resource     variables.robot
Resource     pages/main_page.robot

*** Keywords ***
Open Browser Session
    [Arguments]    ${url}=${BASE_URL}    ${browser}=${BROWSER}
    New Browser    ${browser}    headless=${HEADLESS}
    New Context    acceptDownloads=True
    New Page       ${url}

Login With Credentials
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button

Verify Login Success
    Verify Flash Message Contains    ${MSG_LOGIN_SUCCESS}

Verify Login Failed With Invalid Username
    Verify Flash Message Contains    ${MSG_INVALID_USER}

Verify Login Failed With Invalid Password
    Verify Flash Message Contains    ${MSG_INVALID_PASS}

Verify Logout Success
    Verify Flash Message Contains    ${MSG_LOGOUT_SUCCESS}

Logout From Secure Area
    Click Logout Button


