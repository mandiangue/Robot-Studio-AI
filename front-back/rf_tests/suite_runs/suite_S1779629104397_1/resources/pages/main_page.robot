*** Settings ***
Documentation    Page Object for SauceDemo Main Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open SauceDemo Application
    [Documentation]    Opens the SauceDemo application in the configured browser

    Maximize Browser Window

Close SauceDemo Application
    [Documentation]    Closes the SauceDemo application


Enter Username In Login Form
    [Documentation]    Enters the username in the login input field
    [Arguments]    ${username}
    Input Text    ${LOGIN_INPUT_USERNAME}    ${username}

Enter Password In Login Form
    [Documentation]    Enters the password in the login input field
    [Arguments]    ${password}
    Input Text    ${LOGIN_INPUT_PASSWORD}    ${password}

Click Login Button
    [Documentation]    Clicks the login button
    Click Button    ${LOGIN_BUTTON}

Verify Products List Is Displayed
    [Documentation]    Verifies that the products list is displayed on the page
    Wait Until Element Is Visible    ${PRODUCTS_CONTAINER}    timeout=10s
    Element Should Be Visible    ${PRODUCTS_CONTAINER}

Add First Product To Cart
    [Documentation]    Adds the first product to the shopping cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BUTTON}    timeout=10s
    Click Button    xpath=(${ADD_TO_CART_BUTTON})[1]

Verify Cart Badge Shows Item Count
    [Documentation]    Verifies that the cart badge displays the correct number of items
    [Arguments]    ${expected_count}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Should Contain    ${CART_BADGE}    ${expected_count}

Select Sort Option By Price Low To High
    [Documentation]    Selects the sort option to display products from lowest to highest price
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Click Element    ${SORT_DROPDOWN}
    Click Element    xpath=//option[@value='lohi']

Verify Products Are Sorted By Price Low To High
    [Documentation]    Verifies that products are displayed in ascending order by price
    Wait Until Element Is Visible    ${PRODUCT_ITEM}    timeout=10s
    ${prices}=    Get WebElements    xpath=//div[@class='inventory_item_price']
    ${price_list}=    Create List
    FOR    ${price_element}    IN    @{prices}
        ${price_text}=    Get Text    ${price_element}
        ${price_value}=    Evaluate    float("${price_text}".replace('$', ''))
        Append To List    ${price_list}    ${price_value}
    END
    ${sorted_list}=    Evaluate    sorted(${price_list})
    Lists Should Be Equal    ${price_list}    ${sorted_list}