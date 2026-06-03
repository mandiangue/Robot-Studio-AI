*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Locked Out User
    Open Login Page
    Enter Username    ${LOCKED_USER}
    Enter Password    ${PASSWORD}
    Click Login Button

Verify Locked Out Error Is Displayed
    Verify Locked Out Error Message

Login With Standard User
    Open Login Page
    Enter Username    ${STANDARD_USER}
    Enter Password    ${PASSWORD}
    Click Login Button

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Are Sorted By Price Ascending
    Verify Prices Are Sorted Ascending

Logout From Burger Menu
    Open Burger Menu
    Click Logout

Verify User Is On Login Page
    Verify Redirected To Login Page