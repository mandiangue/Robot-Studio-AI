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

Verify Successful Login
    Flash Message Should Contain    You logged into a secure area!

Verify Invalid Password Error
    Flash Message Should Contain    Your password is invalid!

Verify Invalid Username Error
    Flash Message Should Contain    Your username is invalid!

Logout From Secure Area
    Click Logout Button

Verify Successful Logout
    Flash Message Should Contain    You logged out of the secure area!