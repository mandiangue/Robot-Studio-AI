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

Verify Successful Login
    Flash Message Should Contain    You logged into a secure area!
    Logout Button Should Be Visible

Verify Invalid Password Error
    Login Page Should Be Displayed
    Flash Message Should Contain    Your password is invalid!

Verify Invalid Username Error
    Login Page Should Be Displayed
    Flash Message Should Contain    Your username is invalid!

Perform Logout
    Click Logout Button

Verify Successful Logout
    Login Page Should Be Displayed
    Flash Message Should Contain    You logged out of the secure area!