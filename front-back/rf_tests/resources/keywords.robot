*** Settings ***
Suite Setup       Open Browser    ${url}    ${BROWSER}
Suite Teardown    Close Browser
Library      Browser
Library      Collections
Resource     variables.robot
Resource     pages/login_page.robot
Resource     pages/inventory_page.robot
Resource     pages/cart_page.robot
Resource     pages/checkout_page.robot
Resource     pages/product_detail_page.robot

*** Keywords ***
Open Browser Session
    [Arguments]    ${url}=${BASE_URL}    ${browser}=${BROWSER}
    New Browser    ${browser}    headless=${HEADLESS}
    New Context    acceptDownloads=True
    New Page       ${url}

Login As User
    [Arguments]    ${username}    ${password}
    Go To    ${BASE_URL}
    Fill Username    ${username}
    Fill Password    ${password}
    Click Login Button

Login Should Fail With Locked Error
    Login Error Message Should Be Visible
    Login Error Should Contain Locked Message

Products Are Sorted By Price Low To High
    First Product Price Should Be Lower Than Last

Product Is Added To Cart
    Add First Product To Cart
    Cart Badge Should Show One

Product Is Removed From Cart
    Remove First Item From Cart
    Cart Should Be Empty

Checkout Info Is Filled
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Fill First Name    ${first_name}
    Fill Last Name    ${last_name}
    Fill Postal Code    ${postal_code}
    Click Continue Button

Order Is Confirmed
    Order Confirmation Should Be Visible
    Order Confirmation Text Should Match

User Is On Login Page
    Wait For Elements State    css=[data-test="login-button"]    visible    timeout=10s

Product Detail Is Fully Displayed
    Product Name Should Be Visible
    Product Description Should Be Visible
    Product Price Should Be Visible
    Add To Cart Button Should Be Visible
