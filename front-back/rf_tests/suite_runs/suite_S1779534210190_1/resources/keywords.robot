*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords metier
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_1/resources/pages/login_page.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_1/resources/pages/inventory_page.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779534210190_1/resources/pages/checkout_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Given User Opens The Login Page
    Open Login Page

When User Enters Valid Credentials
    Enter Username    ${USERNAME}
    Enter Password    ${PASSWORD}

When User Enters Invalid Credentials
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}

And User Clicks Login Button
    Click Login Button

Then User Is Redirected To Inventory Page
    Wait For Login To Complete

And The Session Is Established Successfully
    Page Should Contain    Products
    Page Should Contain    Add to cart

When User Selects The First Product
    Select First Product

And User Clicks Add To Cart Button
    Wait Until Element Is Visible    ${ADD_TO_CART_BUTTON}    timeout=5s

Then The Product Is Added To Cart
    Verify Product In Cart

And The Cart Badge Displays Correct Item Count
    ${count}=    Get Cart Badge Count
    Should Be Equal    ${count}    1

When User Navigates To The Cart
    Navigate To Cart

Then User Accesses The Checkout Page
    Click Checkout Button

And User Fills In The Shipping Information
    Fill Shipping Information    John    Doe    12345

And User Proceeds To Payment Review
    Click Continue Button

And User Completes The Order
    Click Finish Button

Then Order Is Completed Successfully
    Verify Order Confirmation

And A Confirmation Page Displays With Order Number
    Page Should Contain Element    ${ORDER_NUMBER}