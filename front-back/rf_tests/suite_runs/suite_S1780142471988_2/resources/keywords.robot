*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Locked User
    Open Login Page
    Fill Login Form    ${LOCKED_USER}    ${PASSWORD}
    Submit Login Form
    Verify Locked User Error

Login With Standard User
    Open Login Page
    Fill Login Form    ${STANDARD_USER}    ${PASSWORD}
    Submit Login Form

Add Backpack To Cart From Product Page
    Navigate To Backpack Detail Page
    Click Add To Cart On Product Page
    Verify Cart Badge Is One
    Verify Remove Button Is Visible

Sort Products By Price Low To High
    Select Sort Option Low To High
    Verify Products Sorted By Price Ascending