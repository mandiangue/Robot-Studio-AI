*** Settings ***
Resource    pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page
    Go To    ${BASE_URL}

Login With Credentials
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button

Verify Successful Login
    ${msg}=    Get Flash Message Text
    Should Contain    ${msg}    You logged into a secure area!
    Location Should Contain    secure

Verify Invalid Password Error
    ${msg}=    Get Flash Message Text
    Should Contain    ${msg}    Your password is invalid!
    Location Should Contain    login

Verify Invalid Username Error
    ${msg}=    Get Flash Message Text
    Should Contain    ${msg}    Your username is invalid!
    Location Should Contain    login

Logout From Secure Area
    Click Logout Button

Verify Successful Logout
    ${msg}=    Get Flash Message Text
    Should Contain    ${msg}    You logged out of the secure area!
    Location Should Contain    login

    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()