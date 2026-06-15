*** Settings ***
Documentation    Page Object for SauceDemo
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Fill Login Username
    [Arguments]    ${username}
    Wait For Elements State    css=[data-test="username"]    visible    timeout=10s
    Fill Text    css=[data-test="username"]    ${username}

Fill Login Password
    [Arguments]    ${password}
    Fill Text    css=[data-test="password"]    ${password}

Click Login Button
    Click    css=[data-test="login-button"]

Wait For Inventory Page
    Wait For Elements State    css=.inventory_list    visible    timeout=10s

Wait For Product Images
    Wait For Elements State    css=img.inventory_item_img    visible    timeout=10s

Choose Sort
    [Arguments]    ${value}
    Wait For Elements State    css=[data-test="product-sort-container"]    visible    timeout=10s
    Select Options By    css=[data-test="product-sort-container"]    value    ${value}

Get Product Prices
    ${texts}=    Get Elements    css=.inventory_item_price
    ${prices}=    Create List
    FOR    ${el}    IN    @{texts}
        ${txt}=    Get Text    ${el}
        ${num}=    Evaluate    float("${txt}".replace("$",""))
        Append To List    ${prices}    ${num}
    END
    RETURN    ${prices}

Click Add To Cart First Product
    Wait For Elements State    css=.inventory_item button    visible    timeout=10s
    Click    css=.inventory_item:first-child button

Click Cart Icon
    Click    css=.shopping_cart_link

Click Remove Button In Cart
    Wait For Elements State    css=.cart_item button    visible    timeout=10s
    Click    css=.cart_item button

Wait For Cart Badge Hidden
    Wait For Elements State    css=.shopping_cart_badge    hidden    timeout=10s

Click Checkout Button
    Wait For Elements State    css=[data-test="checkout"]    visible    timeout=10s
    Click    css=[data-test="checkout"]

Fill First Name
    [Arguments]    ${value}
    Wait For Elements State    css=[data-test="firstName"]    visible    timeout=10s
    Fill Text    css=[data-test="firstName"]    ${value}

Fill Last Name
    [Arguments]    ${value}
    Fill Text    css=[data-test="lastName"]    ${value}

Fill Postal Code
    [Arguments]    ${value}
    Fill Text    css=[data-test="postalCode"]    ${value}

Click Continue Checkout
    Click    css=[data-test="continue"]

Check Error Message Contains
    [Arguments]    ${expected}
    Wait For Elements State    css=[data-test="error"]    visible    timeout=10s
    ${txt}=    Get Text    css=[data-test="error"]
    Should Contain    ${txt}    ${expected}

Click Finish Button
    Wait For Elements State    css=[data-test="finish"]    visible    timeout=10s
    Click    css=[data-test="finish"]

Check Order Complete Header
    Wait For Elements State    css=.complete-header    visible    timeout=10s
    ${txt}=    Get Text    css=.complete-header
    Should Contain    ${txt}    Thank you for your order

Click Burger Menu
    Wait For Elements State    id=react-burger-menu-btn    visible    timeout=10s
    Click    id=react-burger-menu-btn

Click Logout Link
    Wait For Elements State    id=logout_sidebar_link    visible    timeout=10s
    Click    id=logout_sidebar_link

Wait For Login Page
    Wait For Elements State    css=[data-test="login-button"]    visible    timeout=10s

