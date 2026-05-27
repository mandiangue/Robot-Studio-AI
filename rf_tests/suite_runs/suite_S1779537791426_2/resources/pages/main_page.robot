*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Main Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Verify Product List Is Displayed
    Element Should Be Visible    ${PRODUCT_LIST}

Click Add To Cart Button
    Click Button    ${ADD_TO_CART_BUTTON}

Verify Cart Badge Shows Item Count
    [Arguments]    ${expected_count}
    Element Should Contain    ${CART_BADGE}    ${expected_count}

Select Sort Option
    [Arguments]    ${sort_value}
    Select From List By Value    ${SORT_DROPDOWN}    ${sort_value}

Verify Products Are Sorted By Price Ascending
    ${prices}=    Get WebElements    ${PRODUCT_PRICE}
    ${price_list}=    Create List
    FOR    ${price_element}    IN    @{prices}
        ${price_text}=    Get Text    ${price_element}
        ${price_value}=    Evaluate    float('${price_text}'.replace('$', ''))
        Append To List    ${price_list}    ${price_value}
    END
    ${sorted_list}=    Evaluate    sorted(${price_list})
    Should Be Equal    ${price_list}    ${sorted_list}