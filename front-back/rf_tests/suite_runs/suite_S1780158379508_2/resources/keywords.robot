*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Given Open Login Page
    Open Login Page

When Enter Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}

When Enter Invalid Password Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASSWORD}

When Enter Invalid Username Credentials
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${PASSWORD}

When Click On Login Button
    Click Login Button

Then User Should See Success Message
    Flash Message Should Contain    You logged into a secure area!

Then User Should See Invalid Password Error
    Flash Message Should Contain    Your password is invalid!

Then User Should See Invalid Username Error
    Flash Message Should Contain    Your username is invalid!

When Click On Logout Button
    Click Logout Button

Then User Should Be Redirected To Login Page
    Flash Message Should Contain    You logged out of the secure area!