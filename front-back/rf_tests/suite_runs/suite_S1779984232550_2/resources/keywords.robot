*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Login With User
    [Arguments]    ${username}    ${password}
    Open Login Page
    Fill Username    ${username}
    Fill Password    ${password}
    Click Login Button

Verify Locked User Error Message
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    locked out

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Sorted By Price Ascending
    ${prices}=    Get All Product Prices
    ${sorted}=    Copy List    ${prices}
    Sort List    ${sorted}
    Lists Should Be Equal    ${prices}    ${sorted}

Add Product To Cart And Navigate To Cart
    Add First Product To Cart
    Go To Cart

Remove Product From Cart
    Remove Item From Cart

Verify Cart Is Empty
    Cart Should Be Empty