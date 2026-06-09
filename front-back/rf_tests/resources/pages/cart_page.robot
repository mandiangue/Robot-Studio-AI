*** Settings ***
Documentation    Page Object for Cart Page
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Navigate To Cart
    Click    css=[data-test="shopping-cart-link"]

Cart Page Should Be Loaded
    Wait For Elements State    css=[data-test="cart-contents-container"]    visible    timeout=10s

Remove First Item From Cart
    Click    css=[data-test="remove-sauce-labs-backpack"]

Cart Should Be Empty
    Wait For Elements State    css=[data-test="cart-item"]    hidden    timeout=10s

Click Checkout Button
    Click    css=[data-test="checkout"]
