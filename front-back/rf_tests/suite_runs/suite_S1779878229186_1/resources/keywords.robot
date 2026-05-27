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

Login With Wrong Password
    Open Login Page
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASSWORD}
    Click Login Button

Login With Wrong Username
    Open Login Page
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${PASSWORD}
    Click Login Button

Verify Successful Login
    User Should Be On Secure Page

Verify Password Error Message
    User Should Be On Login Page
    Flash Message Should Be Displayed In Red    ${WRONG_PASS_MSG}

Verify Username Error Message
    User Should Be On Login Page
    Flash Message Should Be Displayed In Red    ${WRONG_USER_MSG}

Logout From Secure Area
    Click Logout Button

Verify Logout Message
    User Should Be On Login Page
    Flash Message Should Contain    ${LOGOUT_MSG}