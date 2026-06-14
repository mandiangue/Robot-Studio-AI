*** Settings ***
Documentation    Page Object for the SauceDemo application (ALL selectors here)
Library          Browser
Resource         ../variables.robot

*** Variables ***
${LOGIN_USERNAME_INPUT}      css=[data-test="username"]
${LOGIN_PASSWORD_INPUT}      css=[data-test="password"]
${LOGIN_BUTTON}              css=[data-test="login-button"]
${LOGIN_ERROR_MSG}           css=[data-test="error"]
${INVENTORY_CONTAINER}       css=[data-test="inventory-container"]
${SORT_CONTAINER}            css=[data-test="product-sort-container"]
${CART_LINK}                 css=[data-test="shopping-cart-link"]
${CART_BADGE}                css=[data-test="shopping-cart-badge"]
${CART_CONTENTS}             css=[data-test="cart-contents-container"]
${CART_ITEM}                 css=[data-test="cart-item"]
${ADD_TO_CART_BACKPACK}      css=[data-test="add-to-cart-sauce-labs-backpack"]
${REMOVE_BACKPACK}           css=[data-test="remove-sauce-labs-backpack"]
${CHECKOUT_BUTTON}           css=[data-test="checkout"]
${FIRST_NAME_INPUT}          css=[data-test="firstName"]
${LAST_NAME_INPUT}           css=[data-test="lastName"]
${ZIP_INPUT}                 css=[data-test="postalCode"]
${CONTINUE_BUTTON}           css=[data-test="continue"]
${FINISH_BUTTON}             css=[data-test="finish"]
${COMPLETE_HEADER}           css=[data-test="complete-header"]
${COMPLETE_CONTAINER}        css=[data-test="checkout-complete-container"]
${BURGER_MENU_BTN}           css=#react-burger-menu-btn
${LOGOUT_LINK}               css=[data-test="logout-sidebar-link"]
${PRODUCT_TITLE_LINK}        css=[data-test="item-4-title-link"]
${ITEM_NAME_DETAIL}          css=[data-test="inventory-item-name"]
${ADD_TO_CART_DETAIL}        css=[data-test="add-to-cart"]
${ITEM_PRICE}                css=[data-test="inventory-item-price"]:first-child

*** Keywords ***
Verify Login Page Is Loaded
    Wait For Elements State    ${LOGIN_BUTTON}    visible    timeout=10s

Submit Login Form
    [Arguments]    ${username}    ${password}
    Fill Text    ${LOGIN_USERNAME_INPUT}    ${username}
    Fill Text    ${LOGIN_PASSWORD_INPUT}    ${password}
    Click    ${LOGIN_BUTTON}

Verify Error Message Shown
    Wait For Elements State    ${LOGIN_ERROR_MSG}    visible    timeout=10s

Verify Inventory Page Loaded
    Wait For Elements State    ${INVENTORY_CONTAINER}    visible    timeout=10s

Select Sort Option Low To High
    Select Options By    ${SORT_CONTAINER}    value    lohi

Verify First Price Visible
    Wait For Elements State    ${ITEM_PRICE}    visible    timeout=10s

Add Backpack To Cart
    Click    ${ADD_TO_CART_BACKPACK}
    Wait For Elements State    ${CART_BADGE}    visible    timeout=10s

Go To Cart Page
    Click    ${CART_LINK}
    Wait For Elements State    ${CART_CONTENTS}    visible    timeout=10s

Remove Backpack From Cart
    Click    ${REMOVE_BACKPACK}

Verify Cart Is Empty
    Wait For Elements State    ${CART_ITEM}    hidden    timeout=10s

Verify Cart Badge Gone
    Wait For Elements State    ${CART_BADGE}    hidden    timeout=10s

Go To Checkout
    Click    ${CHECKOUT_BUTTON}
    Wait For Elements State    ${FIRST_NAME_INPUT}    visible    timeout=10s

Fill In Customer Info
    [Arguments]    ${first}    ${last}    ${zip}
    Fill Text    ${FIRST_NAME_INPUT}    ${first}
    Fill Text    ${LAST_NAME_INPUT}    ${last}
    Fill Text    ${ZIP_INPUT}    ${zip}

Continue To Order Summary
    Click    ${CONTINUE_BUTTON}
    Wait For Elements State    ${FINISH_BUTTON}    visible    timeout=10s

Finish The Order
    Click    ${FINISH_BUTTON}
    Wait For Elements State    ${COMPLETE_CONTAINER}    visible    timeout=10s

Verify Order Confirmation
    Wait For Elements State    ${COMPLETE_HEADER}    visible    timeout=10s

Open Side Menu
    Click    ${BURGER_MENU_BTN}
    Wait For Elements State    ${LOGOUT_LINK}    visible    timeout=10s

Click On Logout Option
    Click    ${LOGOUT_LINK}

Verify Login Page Shown
    Wait For Elements State    ${LOGIN_BUTTON}    visible    timeout=10s

Click On Product Detail
    Click    ${PRODUCT_TITLE_LINK}
    Wait For Elements State    ${ITEM_NAME_DETAIL}    visible    timeout=10s

Verify Product Detail Name Visible
    Wait For Elements State    ${ITEM_NAME_DETAIL}    visible    timeout=10s

Verify Add To Cart Button On Detail
    Wait For Elements State    ${ADD_TO_CART_DETAIL}    visible    timeout=10s

