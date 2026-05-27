*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Navigate To Login Page
    Open Login Page

Fill Login Form
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}

Submit Login Form
    Click Login Button

Successful Login Should Be Displayed
    User Should Be On Secure Page
    Flash Message Should Contain    You logged into a secure area!

Invalid Password Error Should Be Displayed
    User Should Be On Login Page
    Flash Message Should Be Red
    Flash Message Should Contain    Your password is invalid!

Invalid Username Error Should Be Displayed
    User Should Be On Login Page
    Flash Message Should Be Red
    Flash Message Should Contain    Your username is invalid!

Perform Logout
    Click Logout Button

Successful Logout Should Be Displayed
    User Should Be On Login Page
    Flash Message Should Contain    You logged out of the secure area!