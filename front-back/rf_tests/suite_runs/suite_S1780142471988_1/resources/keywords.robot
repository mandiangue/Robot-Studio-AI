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
    Flash Message Should Contain    ${SUCCESS_LOGIN}

Verify Password Error Message
    Flash Message Should Contain    ${ERROR_PASSWORD}
    Flash Message Color Should Be Red

Verify Username Error Message
    Flash Message Should Contain    ${ERROR_USERNAME}
    Flash Message Color Should Be Red

Logout From Secure Area
    Click Logout Button

Verify Successful Logout
    Flash Message Should Contain    ${SUCCESS_LOGOUT}