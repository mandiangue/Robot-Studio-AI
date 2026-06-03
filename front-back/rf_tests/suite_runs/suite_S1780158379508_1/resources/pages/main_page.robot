*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - Saucedemo
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Login With Credentials
    [Arguments]    ${username}    ${password}
    Clear Element Text    ${USERNAME_FIELD}
    Input Text    ${USERNAME_FIELD}    ${username}
    Clear Element Text    ${PASSWORD_FIELD}
    Input Text    ${PASSWORD_FIELD}    ${password}
    Click Button    ${LOGIN_BUTTON}

Verify Locked User Error Message
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Be Visible    ${ERROR_MESSAGE}
    Element Text Should Be    ${ERROR_MESSAGE}    Epic sadface: Sorry, this user has been locked out.

Verify Redirect To Inventory
    Wait Until Location Contains    inventory    timeout=10s

Sort Products By Price Low To High
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    lohi

Verify Products Sorted By Price Ascending
    Wait Until Element Is Visible    ${INVENTORY_ITEM_PRICE}    timeout=10s
    ${prices}=    Get WebElements    ${INVENTORY_ITEM_PRICE}
    ${price_values}=    Create List
    FOR    ${price}    IN    @{prices}
        ${text}=    Get Text    ${price}
        ${value}=    Evaluate    float("${text}".replace("$","").strip())
        Append To List    ${price_values}    ${value}
    END
    ${sorted_prices}=    Evaluate    sorted(${price_values})
    Lists Should Be Equal    ${price_values}    ${sorted_prices}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BUTTON}    timeout=10s
    Click Button    ${ADD_TO_CART_BUTTON}

Go To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    ${CART_LIST}    timeout=10s

Remove Product From Cart
    Wait Until Element Is Visible    ${REMOVE_BUTTON}    timeout=10s
    Click Button    ${REMOVE_BUTTON}

Verify Cart Is Empty
    Wait Until Element Is Not Visible    ${REMOVE_BUTTON}    timeout=10s
    Page Should Not Contain Element    ${CART_BADGE}
    Page Should Not Contain Element    ${REMOVE_BUTTON}

Fill Checkout Information
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Wait Until Element Is Visible    ${FIRST_NAME_FIELD}    timeout=10s
    Input Text    ${FIRST_NAME_FIELD}    ${first_name}
    Input Text    ${LAST_NAME_FIELD}    ${last_name}
    Input Text    ${POSTAL_FIELD}    ${postal_code}

Click Continue Checkout
    Click Button    ${CONTINUE_BUTTON}

Click Finish Checkout
    Wait Until Element Is Visible    ${FINISH_BUTTON}    timeout=10s
    Click Button    ${FINISH_BUTTON}

Verify Order Confirmation
    Wait Until Element Is Visible    ${CONFIRM_HEADER}    timeout=10s
    Element Text Should Be    ${CONFIRM_HEADER}    Thank you for your order!
    Element Should Be Visible    ${CONFIRM_TEXT}

Click Checkout
    Click Button    ${CHECKOUT_BUTTON}