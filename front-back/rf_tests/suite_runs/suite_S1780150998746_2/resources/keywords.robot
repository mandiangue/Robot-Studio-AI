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

Verify Locked User Cannot Access Application
    Verify Locked User Error Is Displayed

Login With Standard User
    Open Login Page
    Fill Username    ${STANDARD_USER}
    Fill Password    ${PASSWORD}
    Click Login Button
    Wait Until Element Is Visible    css=.inventory_container    timeout=10s

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Are Sorted By Price Ascending
    Verify Prices Are Sorted Low To High

Add Product To Cart And Navigate To Cart
    Add First Product To Cart
    Go To Cart

Remove Product From Cart And Verify Cart Is Empty
    Remove Product From Cart
    Verify Cart Is Empty