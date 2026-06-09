*** Settings ***
Documentation    Page Object for Inventory Page
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Inventory Page Should Be Loaded
    Wait For Elements State    css=[data-test="inventory-container"]    visible    timeout=10s

Select Sort Option
    [Arguments]    ${option_value}
    Select Options By    css=[data-test="product-sort-container"]    value    ${option_value}

First Product Price Should Be Lower Than Last
    ${first_price}=    Get Text    css=[data-test="inventory-item-price"]:first-of-type
    Log    ${first_price}

Add First Product To Cart
    Click    css=[data-test="add-to-cart-sauce-labs-backpack"]

Click First Product Name
    Click    css=[data-test="inventory-item-name"]:first-of-type

Open Burger Menu
    Click    id=react-burger-menu-btn

Click Logout Link
    Click    id=logout_sidebar_link

Cart Badge Should Show One
    Wait For Elements State    css=[data-test="shopping-cart-badge"]    visible    timeout=10s

Cart Badge Should Not Be Visible
    Wait For Elements State    css=[data-test="shopping-cart-badge"]    hidden    timeout=10s
