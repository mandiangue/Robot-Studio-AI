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
    Enter Username    ${USERNAME_VALID}
    Enter Password    ${PASSWORD_VALID}
    Click Login Button

Login With Wrong Password
    Enter Username    ${USERNAME_VALID}
    Enter Password    ${PASSWORD_WRONG}
    Click Login Button

Login With Wrong Username
    Enter Username    ${USERNAME_WRONG}
    Enter Password    ${PASSWORD_VALID}
    Click Login Button

Verify Successful Login
    User Should Be On Secure Page
    Flash Message Should Contain    You logged into a secure area!

Verify Invalid Password Error
    User Should Be On Login Page
    Flash Message Should Contain    Your password is invalid!

Verify Invalid Username Error
    User Should Be On Login Page
    Flash Message Should Contain    Your username is invalid!

Perform Logout
    Click Logout Button

Verify Successful Logout
    User Should Be On Login Page
    Flash Message Should Contain    You logged out of the secure area!