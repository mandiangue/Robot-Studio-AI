*** Settings ***
Suite Setup       Go To    ${LOGIN_INPUT_USERNAME}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Model for SauceDemo Main Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${LOGIN_INPUT_USERNAME}    10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${LOGIN_INPUT_USERNAME}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${LOGIN_INPUT_PASSWORD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Products Page Is Displayed
    Wait Until Element Is Visible    ${PRODUCTS_TITLE}    10s
    Element Should Be Visible    ${PRODUCTS_TITLE}

Click Add To Cart For Backpack
    Wait Until Element Is Visible    ${ADD_TO_CART_BACKPACK}    10s
    Click Button    ${ADD_TO_CART_BACKPACK}

Verify Item Added To Cart
    Wait Until Element Is Visible    ${CART_BADGE}    10s
    Element Should Contain    ${CART_BADGE}    1
    Wait Until Element Is Visible    ${REMOVE_BUTTON}    10s

Click Cart Icon
    Wait Until Element Is Visible    ${CART_ICON}    10s
    Click Element    ${CART_ICON}

Verify Cart Page Is Displayed
    Wait Until Element Is Visible    ${CART_ITEM}    10s
    Element Should Be Visible    ${CART_ITEM}

Verify Item Details In Cart
    Element Should Be Visible    ${PRODUCT_NAME_IN_CART}
    Element Should Be Visible    ${PRODUCT_PRICE_IN_CART}

Verify Checkout Button Is Visible
    Wait Until Element Is Visible    ${CHECKOUT_BUTTON}    10s
    Element Should Be Visible    ${CHECKOUT_BUTTON}

Verify Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    10s
    Element Should Contain    ${ERROR_MESSAGE}    ${EXPECTED_ERROR_TEXT}

Close Browser Session