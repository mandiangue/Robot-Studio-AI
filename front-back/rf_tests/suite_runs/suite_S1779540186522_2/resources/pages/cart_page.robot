*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Cart Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Cart Should Contain Product
    Wait Until Page Contains Element    ${CART_ITEM}    timeout=5s
    Page Should Contain Element    ${CART_ITEM}

Click Checkout Button
    Click Button    ${CHECKOUT_BUTTON}