*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Given The User Is On The Login Page
    Open Login Page

When The User Enters Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}

When The User Enters Wrong Password Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${WRONG_PASSWORD}

When The User Enters Wrong Username Credentials
    Enter Username    ${WRONG_USERNAME}
    Enter Password    ${PASSWORD}

When The User Clicks The Login Button
    Click Login Button

Then The User Should See The Success Message
    Flash Message Should Contain    ${SUCCESS_MSG}

Then The User Should See The Wrong Password Error Message
    Flash Message Should Contain    ${WRONG_PASS_MSG}

Then The User Should See The Wrong Username Error Message
    Flash Message Should Contain    ${WRONG_USER_MSG}

Then The User Should Remain On The Login Page
    Login Page Should Be Displayed

And The User Should See The Success Flash Message
    Flash Message Should Contain    ${SUCCESS_MSG}

When The User Clicks The Logout Button
    Logout Button Should Be Visible
    Click Logout Button

Then The User Should Be Redirected To The Login Page
    Login Page Should Be Displayed

Then The User Should See The Logout Confirmation Message
    Flash Message Should Contain    ${LOGOUT_MSG}