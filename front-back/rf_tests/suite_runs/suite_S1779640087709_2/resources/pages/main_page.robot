*** Settings ***
Suite Setup       Go To    ${LOGIN_INPUT_USERNAME}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Main Page - Sauce Demo
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Main Page
    [Documentation]    Opens the Sauce Demo application

    Maximize Browser Window

Close Main Page
    [Documentation]    Closes the browser


Enter Username
    [Arguments]    ${username}
    [Documentation]    Enters username in login field
    Input Text    ${LOGIN_INPUT_USERNAME}    ${username}

Enter Password
    [Arguments]    ${password}
    [Documentation]    Enters password in login field
    Input Text    ${LOGIN_INPUT_PASSWORD}    ${password}

Click Login Button
    [Documentation]    Clicks the login button
    Click Button    ${LOGIN_BUTTON}

Verify Products Page Displayed
    [Documentation]    Verifies that the products container is visible
    Wait Until Element Is Visible    ${PRODUCTS_CONTAINER}    timeout=10s
    Element Should Be Visible    ${PRODUCTS_CONTAINER}

Add Product To Cart
    [Arguments]    ${product_name}
    [Documentation]    Adds a specific product to cart
    ${button}=    Get WebElement    xpath=//div[contains(text(), '${product_name}')]/ancestor::div[@class='inventory_item']//button[contains(text(), 'Add to cart')]
    Click Element    ${button}

Verify Product Added To Cart
    [Arguments]    ${expected_quantity}
    [Documentation]    Verifies that cart badge shows correct quantity
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=5s
    Element Should Contain    ${CART_BADGE}    ${expected_quantity}

Open Cart Page
    [Documentation]    Clicks on cart link to open cart
    Click Element    ${CART_LINK}

Verify Product In Cart
    [Arguments]    ${product_name}
    [Documentation]    Verifies that product appears in cart
    Element Should Contain    class:cart_list    ${product_name}

Select Sort Option
    [Arguments]    ${sort_option}
    [Documentation]    Selects sorting option from dropdown
    Select From List By Value    ${SORT_DROPDOWN}    ${sort_option}

Verify Products Sorted By Price Ascending
    [Documentation]    Verifies that products are sorted by price in ascending order
    ${prices}=    Get WebElements    class:inventory_item_price
    ${price_list}=    Create List
    FOR    ${price_element}    IN    @{prices}
        ${price_text}=    Get Text    ${price_element}
        ${price_value}=    Evaluate    float('${price_text}'.replace('$', ''))
        Append To List    ${price_list}    ${price_value}
    END
    ${sorted_list}=    Evaluate    sorted(${price_list})
    Lists Should Be Equal    ${price_list}    ${sorted_list}