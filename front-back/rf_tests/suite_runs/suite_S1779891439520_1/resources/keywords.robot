*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Valid Credentials
    Go To    ${BASE_URL}
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}
    Click Login Button

Login With Wrong Password
    Go To    ${BASE_URL}
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASS}
    Click Login Button

Login With Wrong Username
    Go To    ${BASE_URL}
    Enter Username    ${WRONG_USER}
    Enter Password    ${PASSWORD}
    Click Login Button

Check Successful Login
    Verify Successful Login

Check Invalid Password Error
    Verify Invalid Password Error

Check Invalid Username Error
    Verify Invalid Username Error

Logout From Secure Area
    Click Logout Button

Check Successful Logout
    Verify Successful Logout