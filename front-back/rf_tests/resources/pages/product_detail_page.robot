*** Settings ***
Documentation    Page Object for Product Detail Page
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Product Detail Page Should Be Loaded
    Wait For Elements State    css=[data-test="inventory-item-name"]    visible    timeout=10s

Product Name Should Be Visible
    Wait For Elements State    css=[data-test="inventory-item-name"]    visible    timeout=10s

Product Description Should Be Visible
    Wait For Elements State    css=[data-test="inventory-item-desc"]    visible    timeout=10s

Product Price Should Be Visible
    Wait For Elements State    css=[data-test="inventory-item-price"]    visible    timeout=10s

Add To Cart Button Should Be Visible
    Wait For Elements State    css=[data-test="add-to-cart"]    visible    timeout=10s
