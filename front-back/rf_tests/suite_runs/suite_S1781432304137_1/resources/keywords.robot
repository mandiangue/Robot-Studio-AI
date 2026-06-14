*** Settings ***
Resource    pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    Evaluate    __import__("sys").path.insert(0, r"${EXECDIR}") or __import__("sys").path.insert(0, r"${EXECDIR}${/}..")    sys
    ${driver_path}=    Evaluate    __import__("NoPopupOptions").get_driver_path("${browser}")
    ${opts}=    Evaluate    __import__("NoPopupOptions").get_no_popup_options("${browser}")
    ${is_chrome}=    Evaluate    "${browser}".lower() in ("chrome", "chromium")
    Run Keyword If    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}    options=${opts}
    Run Keyword Unless    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}

Open Login Page
    Go To    ${BASE_URL}

Login With Credentials
    [Arguments]    ${username}    ${password}
    Enter Username    ${username}
    Enter Password    ${password}
    Click Login Button

Login As Standard User
    Login With Credentials    ${STANDARD_USER}    ${PASSWORD}
    Verify Inventory Page Displayed

Login As Locked User
    Login With Credentials    ${LOCKED_USER}    ${PASSWORD}

Verify Locked Out Error Displayed
    Verify Error Message Displayed    Epic sadface: Sorry, this user has been locked out

Sort Products By Price High To Low
    Select Sort Option    Price (high to low)

Verify Products Are Sorted Descending By Price
    Verify Products Sorted By Price Descending

Add Three Products To Cart
    Add Product To Cart    ${ADD_BACKPACK}
    Add Product To Cart    ${ADD_BIKE_LIGHT}
    Add Product To Cart    ${ADD_BOLT_TSHIRT}

Open Cart Page
    Open Cart

Verify Cart Contains Three Items
    Verify Cart Badge Count    3
    Verify Cart Items Count    3

Add One Product To Cart
    Add Product To Cart    ${ADD_BACKPACK}

Proceed To Checkout
    Open Cart
    Click Checkout

Complete Checkout Form
    Fill Checkout Information    ${FIRST_NAME}    ${LAST_NAME}    ${POSTAL_CODE}
    Click Continue

Finalize Order
    Click Finish

Verify Order Success
    Verify Order Confirmation Displayed