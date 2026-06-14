*** Settings ***
Documentation    Page Object for the application (ALL selectors here)
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Enter Username
    [Arguments]    ${username}
    Wait For Elements State    css=[data-test="username"]    visible    timeout=10s
    Fill Text    css=[data-test="username"]    ${username}

Enter Password
    [Arguments]    ${password}
    Fill Text    css=[data-test="password"]    ${password}

Click Login Button
    Click    css=[data-test="login-button"]

Select Sort Option
    [Arguments]    ${value}
    Wait For Elements State    css=[data-test="product-sort-container"]    visible    timeout=10s
    Select Options By    css=[data-test="product-sort-container"]    value    ${value}

Get All Prices
    Wait For Elements State    css=.inventory_item_price    visible    timeout=10s
    ${texts}=    Get Elements    css=.inventory_item_price
    @{prices}=    Create List
    FOR    ${el}    IN    @{texts}
        ${t}=    Get Text    ${el}
        ${clean}=    Replace String    ${t}    $    ${EMPTY}
        ${num}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${num}
    END
    RETURN    ${prices}

Click First Add To Cart Button
    Wait For Elements State    css=.inventory_item button    visible    timeout=10s
    Click    css=.inventory_item:first-child button

Click Cart Icon
    Click    css=.shopping_cart_link

Click Remove Button In Cart
    Wait For Elements State    css=.cart_item button    visible    timeout=10s
    Click    css=.cart_item button

Click Checkout Button
    Click    css=[data-test="checkout"]

Enter First Name
    [Arguments]    ${firstname}
    Wait For Elements State    css=[data-test="firstName"]    visible    timeout=10s
    Fill Text    css=[data-test="firstName"]    ${firstname}

Enter Last Name
    [Arguments]    ${lastname}
    Fill Text    css=[data-test="lastName"]    ${lastname}

Enter Postal Code
    [Arguments]    ${postal}
    Fill Text    css=[data-test="postalCode"]    ${postal}

Click Continue Button
    Click    css=[data-test="continue"]

Click Finish Button
    Click    css=[data-test="finish"]

Click Menu Button
    Wait For Elements State    id=react-burger-menu-btn    visible    timeout=10s
    Click    id=react-burger-menu-btn

Click Logout Menu Item
    Wait For Elements State    id=logout_sidebar_link    visible    timeout=10s
    Click    id=logout_sidebar_link


