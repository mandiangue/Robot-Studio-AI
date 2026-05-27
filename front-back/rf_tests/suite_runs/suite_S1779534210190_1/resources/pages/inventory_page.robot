*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Inventory
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Select First Product
    Click Button    ${ADD_TO_CART_BUTTON}

Get Cart Badge Count
    ${count}=    Get Text    ${CART_BADGE}
    [Return]    ${count}

Navigate To Cart
    Click Element    ${CART_LINK}
    Wait Until Page Contains    Your Cart    timeout=10s

Verify Product In Cart
    Wait Until Page Contains    Sauce Labs    timeout=10s