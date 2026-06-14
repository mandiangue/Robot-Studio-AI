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

Get Error Message Text
    Wait For Elements State    css=[data-test="error"]    visible    timeout=10s
    ${text}=    Get Text    css=[data-test="error"]
    RETURN    ${text}

Select Sort Option
    [Arguments]    ${value}
    Wait For Elements State    css=[data-test="product-sort-container"]    visible    timeout=10s
    Select Options By    css=[data-test="product-sort-container"]    value    ${value}

Get All Product Prices
    Wait For Elements State    css=[data-test="inventory-item-price"]    visible    timeout=10s
    ${texts}=    Get Elements    css=[data-test="inventory-item-price"]
    @{prices}=    Create List
    FOR    ${el}    IN    @{texts}
        ${t}=    Get Text    ${el}
        ${num}=    Evaluate    float("${t}".replace("$",""))
        Append To List    ${prices}    ${num}
    END
    RETURN    ${prices}

Click Add To Cart Button
    [Arguments]    ${product_id}
    Click    css=[data-test="add-to-cart-${product_id}"]

Get Cart Badge Count
    Wait For Elements State    css=[data-test="shopping-cart-badge"]    visible    timeout=10s
    ${text}=    Get Text    css=[data-test="shopping-cart-badge"]
    RETURN    ${text}

Click Cart Icon
    Click    css=[data-test="shopping-cart-link"]

Get Cart Items Count
    ${count}=    Get Element Count    css=[data-test="inventory-item"]
    RETURN    ${count}

Click Remove Button In Cart
    [Arguments]    ${product_id}
    Click    css=[data-test="remove-${product_id}"]

Click Checkout Button
    Wait For Elements State    css=[data-test="checkout"]    visible    timeout=10s
    Click    css=[data-test="checkout"]

Enter First Name
    [Arguments]    ${value}
    Wait For Elements State    css=[data-test="firstName"]    visible    timeout=10s
    Fill Text    css=[data-test="firstName"]    ${value}

Enter Last Name
    [Arguments]    ${value}
    Fill Text    css=[data-test="lastName"]    ${value}

Enter Postal Code
    [Arguments]    ${value}
    Fill Text    css=[data-test="postalCode"]    ${value}

Click Continue Button
    Click    css=[data-test="continue"]

Click Finish Button
    Wait For Elements State    css=[data-test="finish"]    visible    timeout=10s
    Click    css=[data-test="finish"]

Get Checkout Error Text
    Wait For Elements State    css=[data-test="error"]    visible    timeout=10s
    ${text}=    Get Text    css=[data-test="error"]
    RETURN    ${text}

Get Order Confirmation Text
    Wait For Elements State    css=[data-test="complete-header"]    visible    timeout=10s
    ${text}=    Get Text    css=[data-test="complete-header"]
    RETURN    ${text}

