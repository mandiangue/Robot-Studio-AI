*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Main Inventory Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Get Product Add To Cart Button By Index
    [Arguments]    ${index}
    [Documentation]    Get Add to Cart button for product at specified index
    ${button}=    Get WebElements    xpath=(//button[contains(text(), 'Add to cart')])[${index}]
    [Return]    ${button}

Get Cart Badge Text
    [Documentation]    Get the text value from cart badge
    ${badge_text}=    Get Text    ${CART_BADGE}
    [Return]    ${badge_text}

Click Cart Link
    [Documentation]    Click on the shopping cart link
    Click Element    ${CART_LINK}

Select Sort Option
    [Arguments]    ${sort_value}
    [Documentation]    Select a sort option from the dropdown
    Click Element    ${PRODUCT_SORT_DROPDOWN}
    Select From List By Value    ${PRODUCT_SORT_DROPDOWN}    ${sort_value}

Get All Product Prices
    [Documentation]    Get all product prices from the inventory
    ${prices}=    Get WebElements    ${PRODUCT_PRICE}
    [Return]    ${prices}

Verify Welcome Message Visible
    [Documentation]    Verify that the welcome message (Products text) is visible
    Element Should Be Visible    ${WELCOME_MESSAGE}

Verify Products Container Visible
    [Documentation]    Verify that the products container is visible
    Element Should Be Visible    ${PRODUCTS_CONTAINER}