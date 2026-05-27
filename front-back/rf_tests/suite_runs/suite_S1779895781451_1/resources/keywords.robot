*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Valid Credentials
    Open Login Page
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

Login With Wrong Password
    Open Login Page
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${WRONG_PASSWORD}
    Click Login Button

Login With Wrong Username
    Open Login Page
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

Perform Logout
    Click Logout Button

Check Successful Login
    Verify Success Message

Check Invalid Password Error
    Verify Invalid Password Message

Check Invalid Username Error
    Verify Invalid Username Message

Check Successful Logout
    Verify Redirect To Login Page
    Verify Logout Message