*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Locked User
    Open Login Page
    Fill Username    ${LOCKED_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Verify Locked User Cannot Access Catalog
    Verify Locked User Error Message

Login With Valid User
    Open Login Page
    Fill Username    ${STANDARD_USER}
    Fill Password    ${PASSWORD}
    Click Login Button
    Verify Products Page Is Displayed

Sort Products By Price Low To High
    Select Sort Option Low To High

Verify Products Order Is Ascending By Price
    Verify Products Are Sorted By Price Ascending

Logout From Application Via Burger Menu
    Open Burger Menu
    Click Logout

Verify Redirection To Login Page
    Verify User Is On Login Page