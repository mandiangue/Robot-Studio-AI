*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Valid Credentials
    Open Login Page
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}
    Click Login Button

Login With Invalid Password
    Open Login Page
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASSWORD}
    Click Login Button

Login With Invalid Username
    Open Login Page
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${PASSWORD}
    Click Login Button

Verify Successful Login
    Verify Success Message

Verify Failed Login With Wrong Password
    Verify Login Page Is Displayed
    Verify Invalid Password Message

Verify Failed Login With Wrong Username
    Verify Login Page Is Displayed
    Verify Invalid Username Message

Logout From Secure Area
    Click Logout Button
    Verify Login Page Is Displayed
    Verify Logout Message