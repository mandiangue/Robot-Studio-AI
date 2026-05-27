*** Settings ***
Suite Setup       Go To    ${LOGIN_USERNAME_INPUT}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Model for Saucedemo Main Pages
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Wait Until Page Contains Element    ${LOGIN_USERNAME_INPUT}

Enter Username
    [Arguments]    ${username}
    Input Text    ${LOGIN_USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${LOGIN_PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Inventory Page Is Displayed
    Wait Until Page Contains Element    ${INVENTORY_PAGE_INDICATOR}
    Page Should Contain Element    ${PRODUCTS_CONTAINER}

Verify Error Message Is Displayed
    [Arguments]    ${expected_error}
    Wait Until Page Contains Element    ${ERROR_MESSAGE}
    Page Should Contain    ${expected_error}

Click Add To Cart First Product
    Wait Until Page Contains Element    ${FIRST_PRODUCT_ADD_BUTTON}
    Click Button    ${FIRST_PRODUCT_ADD_BUTTON}

Verify Cart Badge Shows Count
    [Arguments]    ${count}
    Wait Until Page Contains Element    ${CART_BADGE}
    Element Should Contain    ${CART_BADGE}    ${count}

Verify Add To Cart Button Changed To Remove
    Wait Until Page Contains Element    ${FIRST_PRODUCT_REMOVE_BUTTON}
    Page Should Contain Element    ${FIRST_PRODUCT_REMOVE_BUTTON}

Select Sort Option Low To High
    Wait Until Page Contains Element    ${SORT_DROPDOWN}
    Click Element    ${SORT_DROPDOWN}
    Click Element    ${SORT_LOW_TO_HIGH}

Verify Products Are Sorted By Price Low To High
    Wait Until Page Contains Element    ${PRODUCTS_CONTAINER}
    ${prices}    Get WebElements    xpath=//div[@class='inventory_item_price']
    ${first_price}    Get Text    xpath=(//div[@class='inventory_item_price'])[1]
    ${last_price}    Get Text    xpath=(//div[@class='inventory_item_price'])[last()]
    Log    Products sorted from ${first_price} to ${last_price}