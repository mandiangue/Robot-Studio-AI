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

Given User Is On Login Page
    Go To    ${BASE_URL}

When User Logs In With
    [Arguments]    ${username}    ${password}
    Submit Login Form    ${username}    ${password}

Then Locked Out Error Is Displayed
    Verify Locked Error Message

Given User Is Logged In As Standard User
    Go To    ${BASE_URL}
    Submit Login Form    ${STANDARD_USER}    ${PASSWORD}
    Verify Inventory Page Loaded

When User Sorts Products By Price High To Low
    Select Sort Option    hilo

Then Products Are Sorted From Highest To Lowest Price
    Verify Products Sorted High To Low

When User Adds Three Products To Cart
    Add Three Products To Cart

Then Cart Badge Shows
    [Arguments]    ${count}
    Verify Cart Badge Equals    ${count}

And Three Products Are Visible In Cart
    Open Cart Page
    Verify Cart Items Count    3

When User Adds One Product To Cart
    Add Single Product To Cart

And User Opens The Cart
    Open Cart Page

And User Removes The Product From Cart
    Remove Product From Cart

Then Cart Badge Is Not Visible
    Verify Cart Badge Not Visible

When User Proceeds To Checkout
    Proceed To Checkout

And User Fills Checkout Information
    [Arguments]    ${first}    ${last}    ${zip}
    Fill Checkout Information    ${first}    ${last}    ${zip}

And User Finishes The Order
    Finish Order

Then Order Confirmation Is Displayed
    Verify Order Confirmation

When User Opens The Side Menu
    Open Side Menu

And User Clicks Logout
    Click Logout

Then User Is Redirected To Login Page
    Verify Login Page Displayed