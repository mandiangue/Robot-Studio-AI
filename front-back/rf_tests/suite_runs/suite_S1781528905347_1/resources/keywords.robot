*** Settings ***
Library      Browser
Library      Collections
Resource     variables.robot
Resource     pages/main_page.robot

*** Keywords ***
Open Browser Session
    [Arguments]    ${url}=${BASE_URL}    ${browser}=${BROWSER}
    New Browser    ${browser}    headless=${HEADLESS}
    New Context    acceptDownloads=True
    New Page       ${url}

Login With User
    [Arguments]    ${username}    ${password}
    Fill Login Username    ${username}
    Fill Login Password    ${password}
    Click Login Button

Verify Inventory Page Displayed
    Wait For Inventory Page

Verify Product Images Present
    Wait For Product Images

Select Sort Option
    [Arguments]    ${value}
    Choose Sort    ${value}

Verify Products Sorted High To Low
    ${prices}=    Get Product Prices
    ${sorted}=    Evaluate    sorted(${prices}, reverse=True)
    Lists Should Be Equal    ${prices}    ${sorted}

Add First Product To Cart
    Click Add To Cart First Product

Open Cart Page
    Click Cart Icon

Remove Product From Cart
    Click Remove Button In Cart

Verify Cart Badge Not Visible
    Wait For Cart Badge Hidden

Go To Checkout
    Click Checkout Button

Click Continue On Checkout
    Click Continue Checkout

Verify Error Message Displayed
    [Arguments]    ${expected}
    Check Error Message Contains    ${expected}

Fill Checkout Information
    [Arguments]    ${first}    ${last}    ${postal}
    Fill First Name    ${first}
    Fill Last Name    ${last}
    Fill Postal Code    ${postal}

Finish Order
    Click Finish Button

Verify Order Confirmation
    Check Order Complete Header

Open Side Menu
    Click Burger Menu

Click Logout
    Click Logout Link

Verify Login Page Displayed
    Wait For Login Page

