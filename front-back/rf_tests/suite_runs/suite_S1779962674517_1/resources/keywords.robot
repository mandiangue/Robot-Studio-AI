*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With Valid Credentials
    Open Login Page
    Enter Username    ${VALID_USER}
    Enter Password    ${VALID_PASS}
    Click Login Button

Login With Invalid Credentials
    Open Login Page
    Enter Username    ${INVALID_USER}
    Enter Password    ${INVALID_PASS}
    Click Login Button

Verify Successful Login
    Verify Inventory Page Is Displayed

Verify Failed Login With Error Message
    Verify Error Message Is Displayed
    Verify Error Message Text Contains    Username and password do not match
    Verify User Stays On Login Page

Add First Product To Cart
    Click Add To Cart First Product

Verify Product Added To Cart
    Verify Cart Badge Displays    1
    Verify Remove Button Is Displayed

Sort Products By Price Low To High
    Select Sort Option Low To High

Verify Products Are Sorted By Ascending Price
    Verify Products Sorted By Price Low To High