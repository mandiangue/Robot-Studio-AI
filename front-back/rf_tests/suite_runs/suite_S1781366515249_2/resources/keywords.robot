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

Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chromium


Login With Credentials
    [Arguments]    ${username}    ${password}
    Go To Login Page
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button

Verify Successful Login
    Verify Url Contains    /secure
    Verify Flash Message Contains    ${SUCCESS_MESSAGE}

Verify Invalid Password Error
    Verify Flash Message Contains    ${INVALID_PASSWORD_MSG}
    Verify Url Contains    /login

Verify Invalid Username Error
    Verify Flash Message Contains    ${INVALID_USERNAME_MSG}
    Verify Url Contains    /login

Logout From Secure Area
    Click Logout Button

Verify Successful Logout
    Verify Url Contains    /login
    Verify Flash Message Contains    ${LOGOUT_MESSAGE}

Verify Url Contains
    [Arguments]    ${fragment}
    ${url}=    Get Url
    Should Contain    ${url}    ${fragment}


