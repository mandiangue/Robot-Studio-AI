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

Open Browser No Popup
    [Arguments]    ${url}    ${browser}=${BROWSER}


Login With User
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button

Verify Inventory Page Loaded
    Wait For Elements State    css=[data-test="inventory-list"]    visible    timeout=30s
    ${url}=    Get Url
    Should Contain    ${url}    inventory.html

Sort Products By
    [Arguments]    ${value}
    Select Sort Option    ${value}

Verify Products Sorted Descending By Price
    @{prices}=    Get All Prices
    @{sorted_prices}=    Copy List    ${prices}
    Sort List    ${sorted_prices}
    Reverse List    ${sorted_prices}
    Lists Should Be Equal    ${prices}    ${sorted_prices}

Add First Product To Cart
    Click First Add To Cart Button

Open Cart
    Click Cart Icon

Remove Product From Cart
    Click Remove Button In Cart

Verify Cart Badge Empty
    ${count}=    Get Element Count    css=.shopping_cart_badge
    Should Be Equal As Integers    ${count}    0

Proceed To Checkout
    Click Checkout Button

Fill Checkout Information
    [Arguments]    ${firstname}    ${lastname}    ${postal}
    Enter First Name    ${firstname}
    Enter Last Name    ${lastname}
    Enter Postal Code    ${postal}

Continue Checkout
    Click Continue Button

Finish Checkout
    Click Finish Button

Verify Order Confirmation
    Wait For Elements State    css=[data-test="complete-header"]    visible    timeout=10s
    ${text}=    Get Text    css=[data-test="complete-header"]
    Should Contain    ${text}    Thank you for your order

Verify Error Message Contains
    [Arguments]    ${expected}
    Wait For Elements State    css=[data-test="error"]    visible    timeout=10s
    ${msg}=    Get Text    css=[data-test="error"]
    Should Contain    ${msg}    ${expected}

Open Side Menu
    Click Menu Button

Click Logout Link
    Click Logout Menu Item

Verify Login Page Displayed
    Wait For Elements State    css=[data-test="login-button"]    visible    timeout=10s
    ${url}=    Get Url
    Should Contain    ${url}    saucedemo.com


