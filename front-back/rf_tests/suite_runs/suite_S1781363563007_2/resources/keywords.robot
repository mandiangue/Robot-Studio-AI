*** Settings ***
Library      Browser
Library      Collections
Resource     variables.robot
Resource     pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Evaluate    __import__("sys").path.insert(0, r"${EXECDIR}") or __import__("sys").path.insert(0, r"${EXECDIR}${/}..")    sys
    ${driver_path}=    Evaluate    __import__("NoPopupOptions").get_driver_path("${browser}")
    ${opts}=    Evaluate    __import__("NoPopupOptions").get_no_popup_options("${browser}")
    ${is_chrome}=    Evaluate    "${browser}".lower() in ("chrome", "chromium")
    Run Keyword If    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}    options=${opts}
    Run Keyword Unless    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}

Open Browser Session
    [Arguments]    ${url}=${BASE_URL}    ${browser}=${BROWSER}
    New Browser    ${browser}    headless=${HEADLESS}
    New Context    acceptDownloads=True
    New Page       ${url}

User Is On Login Page
    Go To    ${BASE_URL}
    Wait For Elements State    css=[data-test="login-button"]    visible    timeout=10s

User Logs In With Credentials
    [Arguments]    ${username}    ${password}
    Fill Text    css=[data-test="username"]    ${username}
    Fill Text    css=[data-test="password"]    ${password}
    Click    css=[data-test="login-button"]

Login Error Message Is Visible
    Wait For Elements State    css=[data-test="error"]    visible    timeout=10s

Login Error Contains Locked Message
    Get Text    css=[data-test="error"]

User Is Logged In As Standard User
    Go To    ${BASE_URL}
    Wait For Elements State    css=[data-test="username"]    visible    timeout=10s
    Fill Text    css=[data-test="username"]    ${VALID_USER}
    Fill Text    css=[data-test="password"]    ${PASSWORD}
    Click    css=[data-test="login-button"]
    Wait For Elements State    css=[data-test="inventory-container"]    visible    timeout=10s

User Sorts Products By Price Low To High
    Wait For Elements State    css=[data-test="product-sort-container"]    visible    timeout=10s
    Select Options By    css=[data-test="product-sort-container"]    value    lohi

Products Are Displayed By Price Ascending
    Wait For Elements State    css=[data-test="inventory-item-price"]:first-child    visible    timeout=10s

User Adds First Product To Cart
    Click    css=[data-test="add-to-cart-sauce-labs-backpack"]
    Wait For Elements State    css=[data-test="shopping-cart-badge"]    visible    timeout=10s

User Navigates To Cart
    Click    css=[data-test="shopping-cart-link"]
    Wait For Elements State    css=[data-test="cart-contents-container"]    visible    timeout=10s

User Removes Product From Cart
    Click    css=[data-test="remove-sauce-labs-backpack"]

Cart Is Empty
    Wait For Elements State    css=[data-test="cart-item"]    hidden    timeout=10s

Cart Badge Is Not Visible
    Wait For Elements State    css=[data-test="shopping-cart-badge"]    hidden    timeout=10s

User Proceeds To Checkout
    Click    css=[data-test="checkout"]
    Wait For Elements State    css=[data-test="checkout-info-container"]    visible    timeout=10s

User Fills Checkout Information
    [Arguments]    ${first_name}    ${last_name}    ${zip}
    Fill Text    css=[data-test="firstName"]    ${first_name}
    Fill Text    css=[data-test="lastName"]    ${last_name}
    Fill Text    css=[data-test="postalCode"]    ${zip}

User Continues Checkout
    Click    css=[data-test="continue"]
    Wait For Elements State    css=[data-test="checkout-summary-container"]    visible    timeout=10s

User Finishes Order
    Click    css=[data-test="finish"]
    Wait For Elements State    css=[data-test="checkout-complete-container"]    visible    timeout=10s

Order Confirmation Is Displayed
    Wait For Elements State    css=[data-test="complete-header"]    visible    timeout=10s

User Opens Hamburger Menu
    Click    css=#react-burger-menu-btn
    Wait For Elements State    css=[data-test="logout-sidebar-link"]    visible    timeout=10s

User Clicks Logout
    Click    css=[data-test="logout-sidebar-link"]

User Is Redirected To Login Page
    Wait For Elements State    css=[data-test="login-button"]    visible    timeout=10s

User Clicks On First Product Name
    Click    css=[data-test="item-4-title-link"]
    Wait For Elements State    css=[data-test="inventory-item-name"]    visible    timeout=10s

Product Detail Page Is Displayed
    Wait For Elements State    css=[data-test="inventory-item-name"]    visible    timeout=10s

Product Detail Has Add To Cart Button
    Wait For Elements State    css=[data-test="add-to-cart"]    visible    timeout=10s

