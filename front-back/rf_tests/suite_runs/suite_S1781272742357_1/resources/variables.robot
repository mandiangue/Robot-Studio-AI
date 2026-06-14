*** Settings ***
Documentation    Variables

*** Variables ***
${BASE_URL}              https://www.saucedemo.com
${BROWSER}               chromium
${HEADLESS}              ${False}
${STANDARD_USER}         standard_user
${LOCKED_USER}           locked_out_user
${PASSWORD}              secret_sauce
${LOCKED_ERROR_MSG}      Epic sadface: Sorry, this user has been locked out.
${FIRSTNAME_ERROR_MSG}   Error: First Name is required
${CHECKOUT_FIRSTNAME}    John
${CHECKOUT_LASTNAME}     Doe
${CHECKOUT_POSTAL}       75001
${ORDER_SUCCESS_MSG}     Thank you for your order!

