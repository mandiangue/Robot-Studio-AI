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

Login With User
    [Arguments]    ${username}    ${password}
    Open Login Page
    Enter Credentials    ${username}    ${password}
    Click Login Button

Login As Standard User
    Login With User    ${STANDARD_USER}    ${PASSWORD}
    Verify Inventory Page Displayed

Login As Problem User
    Login With User    ${PROBLEM_USER}    ${PASSWORD}
    Verify Inventory Page Displayed

Sort Products By Price High To Low
    Select Sort Option    Price (high to low)

Add Product To Cart And Open Cart
    Add Backpack To Cart
    Open Cart Page

Logout From Application
    Open Burger Menu
    Click Logout Link

Complete Checkout With Information
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Click Checkout Button
    Fill Checkout Information    ${first_name}    ${last_name}    ${postal_code}
    Click Continue Button
    Click Finish Button

Submit Empty Checkout Form
    Click Checkout Button
    Click Continue Button