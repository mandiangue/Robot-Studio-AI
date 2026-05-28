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

Verify Locked User Error Message
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    ${LOCKED_ERROR_MSG}

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Sorted By Price Ascending
    ${prices}=    Get All Product Prices
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}

Add Product To Cart And Go To Cart
    Add First Product To Cart
    Go To Cart Page

Remove Product From Cart
    Click Remove Button

Verify Cart Is Empty And Badge Gone
    Verify Cart Is Empty
    Verify Cart Badge Is Gone