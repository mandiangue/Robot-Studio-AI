*** Settings ***
Documentation    Page Object for SauceDemo
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Fill Login Username
    [Arguments]    ${username}
    Fill Text    css=[data-test="username"]    ${username}

Fill Login Password
    [Arguments]    ${password}
    Fill Text    css=[data-test="password"]    ${password}

Click Login Button
    Click    css=[data-test="login-button"]

Select Sort Option
    [Arguments]    ${value}
    Select Options By    css=[data-test="product-sort-container"]    value    ${value}

Get All Product Prices
    ${elements}=    Get Elements    css=.inventory_item_price
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${text}=    Get Text    ${el}
        ${num}=    Evaluate    float("${text}".replace("$",""))
        Append To List    ${prices}    ${num}
    END
    RETURN    ${prices}

Click Add To Cart
    [Arguments]    ${data_test}
    Click    css=[data-test="${data_test}"]

Get Cart Badge Text
    Wait For Elements State    css=[data-test="shopping-cart-badge"]    visible    timeout=10s
    ${text}=    Get Text    css=[data-test="shopping-cart-badge"]
    RETURN    ${text}

Open Cart Page
    Click    css=[data-test="shopping-cart-link"]
    Wait For Elements State    css=[data-test="cart-list"]    visible    timeout=10s

Click Remove Button
    [Arguments]    ${data_test}
    Click    css=[data-test="${data_test}"]

Click Checkout Button
    Click    css=[data-test="checkout"]

Fill Checkout Information
    [Arguments]    ${first}    ${last}    ${postal}
    Fill Text    css=[data-test="firstName"]    ${first}
    Fill Text    css=[data-test="lastName"]    ${last}
    Fill Text    css=[data-test="postalCode"]    ${postal}

Click Continue Button
    Click    css=[data-test="continue"]

Click Finish Button
    Click    css=[data-test="finish"]

Click Menu Button
    Click    id=react-burger-menu-btn

Click Logout Link
    Click    css=[data-test="logout-sidebar-link"]





