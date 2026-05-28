*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Navigate To Login Page
    Open Login Page

Login With Credentials
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button

Verify Successful Login
    Verify Success Message

Verify Failed Login With Wrong Password
    Verify Invalid Password Message

Verify Failed Login With Wrong Username
    Verify Invalid Username Message

Perform Logout
    Click Logout Button

Verify Successful Logout
    Verify Logout Message

Verify User Is On Login Page
    Verify Login Page Is Displayed