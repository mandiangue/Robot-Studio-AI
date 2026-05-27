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
    Submit Login

Verify Locked User Error Is Displayed
    Error Message Is Visible
    Error Message Contains Locked Text

Login With Standard User
    Open Login Page
    Fill Username    ${STANDARD_USER}
    Fill Password    ${PASSWORD}
    Submit Login

Add First Product To Cart
    Click Add To Cart Button

Verify Cart Badge Is Incremented
    Cart Badge Shows Count    1

Verify Product Button Changed To Remove
    Product Button Shows Remove

Sort Products By Price Low To High
    Select Sort Option Price Low To High

Verify Products Are Sorted By Ascending Price
    Products Are Sorted By Price Ascending