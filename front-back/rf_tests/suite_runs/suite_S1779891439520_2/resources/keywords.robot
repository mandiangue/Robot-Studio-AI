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

Verify Locked User Error Message
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    Sorry, this user has been locked out

Login With Standard User
    Open Login Page
    Fill Username    ${STANDARD_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Sorted By Price Ascending
    ${prices}=    Get All Product Prices
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}

Add Product To Cart And Go To Cart
    Add First Product To Cart
    Go To Cart

Remove Product From Cart
    Click Remove Button

Verify Cart Is Empty
    Cart Should Be Empty
    Cart Badge Should Not Exist