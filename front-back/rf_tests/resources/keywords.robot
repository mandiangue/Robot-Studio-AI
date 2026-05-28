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

Perform Logout After Login
    Open Login Page
    Enter Username    ${USERNAME_VALID}
    Enter Password    ${PASSWORD_VALID}
    Click Login Button
    Verify Successful Login
    Click Logout Button