*** Settings ***
Resource    pages/login_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Open Login Page
    Go To    ${BASE_URL}

Login With Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}
    Click Login Button

Login With Wrong Password
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASS}
    Click Login Button

Login With Wrong Username
    Enter Username    ${WRONG_USER}
    Enter Password    ${PASSWORD}
    Click Login Button

Verify Successful Login
    Verify Success Message

Verify Failed Login With Wrong Password
    Verify User Is On Login Page
    Verify Invalid Password Message

Verify Failed Login With Wrong Username
    Verify User Is On Login Page
    Verify Invalid Username Message

Perform Logout
    Click Logout Button

Verify Successful Logout
    Verify User Is On Login Page
    Verify Logout Message