*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Credentials
    [Arguments]    ${username}    ${password}
    Open Login Page
    Fill Username    ${username}
    Fill Password    ${password}
    Click Login Button

Attempt Login With Locked User
    Login With Credentials    ${LOCKED_USER}    ${PASSWORD}

Verify Locked Out Error Message Is Shown
    Verify Locked User Error Is Displayed

Login As Standard User
    Login With Credentials    ${STANDARD_USER}    ${PASSWORD}

Navigate To Product Detail And Add To Cart
    Open First Product Detail Page
    Click Add To Cart On Detail Page

Verify Cart Counter Is One And Remove Button Shown
    Verify Cart Badge Is One
    Verify Remove Button Is Displayed

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Are Sorted By Price Ascending
    Verify Prices Are Sorted Ascending