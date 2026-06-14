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

Verify Products Page Displayed
    Wait For Elements State    css=[data-test="inventory-container"]    visible    timeout=10s
    ${url}=    Get Url
    Should Contain    ${url}    inventory.html

Sort Products By
    [Arguments]    ${value}
    Select Sort Option    ${value}

Verify Prices Sorted Ascending
    ${prices}=    Get All Product Prices
    ${sorted}=    Copy List    ${prices}
    Sort List    ${sorted}
    Lists Should Be Equal    ${prices}    ${sorted}

Add Three Products To Cart
    Click Add To Cart    add-to-cart-sauce-labs-backpack
    Click Add To Cart    add-to-cart-sauce-labs-bike-light
    Click Add To Cart    add-to-cart-sauce-labs-bolt-t-shirt

Verify Cart Badge Count
    [Arguments]    ${count}
    ${text}=    Get Cart Badge Text
    Should Be Equal As Strings    ${text}    ${count}

Verify Cart Items Count
    [Arguments]    ${count}
    Open Cart Page
    ${items}=    Get Element Count    css=.cart_item
    Should Be Equal As Integers    ${items}    ${count}

Add One Product To Cart
    Click Add To Cart    add-to-cart-sauce-labs-backpack

Remove Product From Cart Page
    Open Cart Page
    Click Remove Button    remove-sauce-labs-backpack

Verify Cart Badge Not Visible
    Wait For Elements State    css=[data-test="shopping-cart-badge"]    hidden    timeout=10s

Complete Checkout Process
    [Arguments]    ${first}    ${last}    ${postal}
    Open Cart Page
    Click Checkout Button
    Fill Checkout Information    ${first}    ${last}    ${postal}
    Click Continue Button
    Click Finish Button

Verify Order Confirmation
    Wait For Elements State    css=[data-test="complete-header"]    visible    timeout=10s
    ${text}=    Get Text    css=[data-test="complete-header"]
    Should Contain    ${text}    Thank you for your order

Open Menu And Logout
    Click Menu Button
    Wait For Elements State    css=[data-test="logout-sidebar-link"]    visible    timeout=10s
    Click Logout Link

Verify Login Page Displayed
    Wait For Elements State    css=[data-test="login-button"]    visible    timeout=10s
    ${url}=    Get Url
    Should Contain    ${url}    saucedemo.com

Verify Product Images Loaded
    ${count}=    Get Element Count    css=img.inventory_item_img
    Should Be True    ${count} > 0





