*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Navigate To Login Page
    Open Login Page

Login With Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}
    Click Login Button

Login With Wrong Password
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASSWORD}
    Click Login Button

Login With Wrong Username
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${PASSWORD}
    Click Login Button

Check Success Message Is Displayed
    Verify Success Message

Check Invalid Password Message Is Displayed
    Verify Invalid Password Message

Check Invalid Username Message Is Displayed
    Verify Invalid Username Message

Perform Logout
    Click Logout Button

Check Logout Message Is Displayed
    Verify Logout Message

Check Login Page Is Displayed
    Verify Login Page Is Displayed