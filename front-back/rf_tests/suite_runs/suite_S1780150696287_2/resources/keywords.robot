*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Valid Credentials
    Open Login Page
    Enter Username    ${USERNAME_VALID}
    Enter Password    ${PASSWORD_VALID}
    Click Login Button

Login With Wrong Password
    Open Login Page
    Enter Username    ${USERNAME_VALID}
    Enter Password    ${PASSWORD_WRONG}
    Click Login Button

Login With Wrong Username
    Open Login Page
    Enter Username    ${USERNAME_WRONG}
    Enter Password    ${PASSWORD_VALID}
    Click Login Button

Verify Successful Login
    Flash Message Should Contain    ${SUCCESS_LOGIN}
    Location Should Contain    secure

Verify Invalid Password Error
    Flash Message Should Contain    ${ERROR_PASSWORD}
    Verify Flash Message Color Is Red
    Location Should Contain    login

Verify Invalid Username Error
    Flash Message Should Contain    ${ERROR_USERNAME}
    Verify Flash Message Color Is Red
    Location Should Contain    login

Logout From Secure Area
    Click Logout Button

Verify Successful Logout
    Flash Message Should Contain    ${SUCCESS_LOGOUT}
    Location Should Contain    login