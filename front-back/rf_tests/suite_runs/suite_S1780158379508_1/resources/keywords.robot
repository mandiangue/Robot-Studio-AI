*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}



Given Open Login Page
    Open Login Page

When Login With Locked User
    Login With Credentials    ${LOCKED_USER}    ${PASSWORD}

Then Error Message For Locked User Is Displayed
    Verify Locked User Error Message

When Login With Standard User
    Login With Credentials    ${STANDARD_USER}    ${PASSWORD}

Then User Is Redirected To Inventory Page
    Verify Redirect To Inventory

When User Sorts Products By Price Low To High
    Sort Products By Price Low To High

Then Products Are Displayed In Ascending Price Order
    Verify Products Sorted By Price Ascending

When User Adds First Product To Cart
    Add First Product To Cart

And User Goes To Cart
    Go To Cart

When User Removes Product From Cart
    Remove Product From Cart

Then Cart Is Empty
    Verify Cart Is Empty

When User Clicks Checkout
    Click Checkout

And User Fills Checkout Information
    Fill Checkout Information    ${FIRST_NAME}    ${LAST_NAME}    ${POSTAL_CODE}

And User Clicks Continue
    Click Continue Checkout

And User Clicks Finish
    Click Finish Checkout

Then Order Confirmation Is Displayed
    Verify Order Confirmation