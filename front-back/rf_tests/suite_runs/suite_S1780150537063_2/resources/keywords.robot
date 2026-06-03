*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login As Locked User
    Open Login Page
    Fill Username    ${LOCKED_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Verify Locked User Cannot Login
    Verify Locked Error Message Is Displayed

Login As Standard User
    Open Login Page
    Fill Username    ${STANDARD_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Sorted By Price Ascending
    Verify Prices Are Sorted Ascending

Add Backpack To Cart
    Click Add To Cart Backpack

Go To Cart
    Click Cart Icon

Verify Cart Has One Backpack
    Verify Cart Badge Count    1
    Verify Cart Contains Backpack
    Verify Cart Item Price