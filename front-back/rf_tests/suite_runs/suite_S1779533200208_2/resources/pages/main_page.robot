*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Main/Inventory Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Verify Products Page Is Displayed
    Wait Until Element Is Visible    ${PRODUCTS_CONTAINER}    timeout=10s
    Element Should Be Visible    ${PRODUCTS_CONTAINER}

Get Cart Badge Count
    ${count}=    Get Text    ${CART_BADGE}
    [Return]    ${count}

Click Add To Cart Button For First Product
    Wait Until Element Is Visible    ${ADD_TO_CART_BUTTON}    timeout=10s
    Click Button    ${ADD_TO_CART_BUTTON}

Select Sort Option By Price Low To High
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Click Element    ${SORT_DROPDOWN}
    Select From List By Value    ${SORT_DROPDOWN}    ${SORT_PRICE_LOW_HIGH}

Get All Product Prices
    ${price_elements}=    Get WebElements    ${PRODUCT_PRICE}
    ${prices}=    Create List
    FOR    ${element}    IN    @{price_elements}
        ${price_text}=    Get Text    ${element}
        ${price_value}=    Fetch From Left    ${price_text}    $
        Append To List    ${prices}    ${price_value}
    END
    [Return]    ${prices}

Verify Products Are Sorted By Price Low To High
    ${prices}=    Get All Product Prices
    ${sorted_prices}=    Evaluate    sorted(${prices}, key=float)
    Should Be Equal    ${prices}    ${sorted_prices}