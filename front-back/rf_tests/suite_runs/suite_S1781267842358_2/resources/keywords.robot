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
    Open Login Page

When User Logs In With
    [Arguments]    ${user}    ${pass}
    Login With Credentials    ${user}    ${pass}

Then User Should Be On Inventory Page
    Verify Inventory Page Displayed

When User Selects Sort Option
    [Arguments]    ${value}
    Select Sort Option    ${value}

Then Products Should Be Sorted By Price Descending
    Verify Prices Sorted Descending

When User Adds Product To Cart
    [Arguments]    ${locator}
    Add Product To Cart    ${locator}

Then Cart Badge Should Show
    [Arguments]    ${count}
    Verify Cart Badge Count    ${count}

When User Opens Cart
    Open Cart

Then Cart Should Contain Items
    [Arguments]    ${count}
    Verify Cart Items Count    ${count}

When User Removes Product From Cart
    [Arguments]    ${locator}
    Remove Product From Cart    ${locator}

Then Cart Should Be Empty
    Verify Cart Badge Not Visible

When User Starts Checkout
    Start Checkout

When User Clicks Continue
    Click Continue

When User Fills Checkout Information
    [Arguments]    ${first}    ${last}    ${zip}
    Fill Checkout Information    ${first}    ${last}    ${zip}

When User Clicks Finish
    Click Finish

Then Error Message Should Contain
    [Arguments]    ${text}
    Verify Error Message Contains    ${text}

Then Order Should Be Confirmed
    Verify Order Confirmation