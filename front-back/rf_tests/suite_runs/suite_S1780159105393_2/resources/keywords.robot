*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Given Open Login Page
    Open Login Page

When User Logs In With Locked Account
    Fill Username    ${LOCKED_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Then Error Message Should Show User Is Locked Out
    Error Message Is Displayed With Text    ${LOCKED_ERROR}

Given User Is Logged In With Valid Account
    Open Login Page
    Fill Username    ${VALID_USER}
    Fill Password    ${PASSWORD}
    Click Login Button
    Wait Until Element Is Visible    css=.inventory_container    timeout=10s

When User Selects Price Low To High Sort
    Select Sort Option    ${SORT_PRICE_LOW}

Then Products Should Be Sorted By Price Low To High
    Prices Are Sorted Low To High

When User Adds First Product To Cart And Navigates To Cart
    Add First Product To Cart
    Go To Cart

When User Removes The Item From Cart
    Remove Item From Cart

Then Cart Should Be Empty And Badge Should Disappear
    Cart Is Empty
    Cart Badge Is Not Visible