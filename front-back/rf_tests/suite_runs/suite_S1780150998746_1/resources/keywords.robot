*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Valid Credentials
    Open Login Page
    Enter Username    ${VALID_USER}
    Enter Password    ${VALID_PASS}
    Click Login Button

Login With Invalid Password
    Open Login Page
    Enter Username    ${VALID_USER}
    Enter Password    ${WRONG_PASS}
    Click Login Button

Login With Invalid Username
    Open Login Page
    Enter Username    ${WRONG_USER}
    Enter Password    ${VALID_PASS}
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