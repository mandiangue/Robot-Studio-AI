*** Settings ***
Suite Setup       Go To    ${LOGIN_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${LOGIN_URL}

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Inventory Page Is Displayed
    Location Should Be    ${INVENTORY_URL}

Select Sort Option By Price Low To High
    Select From List By Value    ${SORT_DROPDOWN}    ${SORT_PRICE_LOW}

Get All Product Prices
    ${price_elements}=    Get WebElements    css=.inventory_item_price
    ${prices}=    Create List
    FOR    ${el}    IN    @{price_elements}
        ${text}=    Get Text    ${el}
        ${value}=    Evaluate    float("${text}".replace("$", "").strip())
        Append To List    ${prices}    ${value}
    END
    RETURN    ${prices}

Verify Prices Are Sorted Ascending
    ${prices}=    Get All Product Prices
    ${sorted}=    Evaluate    sorted(${prices})
    Should Be Equal    ${prices}    ${sorted}

Add First Product To Cart
    Click Button    css=.inventory_item:first-child .btn_primary

Verify Cart Badge Count
    [Arguments]    ${expected_count}
    ${badge_text}=    Get Text    ${CART_BADGE}
    Should Be Equal As Integers    ${badge_text}    ${expected_count}

Navigate To Cart
    Click Element    ${CART_LINK}
    Location Should Be    ${CART_URL}

Remove Item From Cart
    Click Button    ${REMOVE_BUTTON}

Verify Cart Is Empty
    Page Should Not Contain Element    ${CART_BADGE}
    Page Should Not Contain Element    css=.cart_item

Open Burger Menu
    Click Element    ${BURGER_MENU}

Click Logout
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=5s
    Click Element    ${LOGOUT_LINK}

Verify Login Page Is Displayed
    Location Should Be    ${LOGIN_URL}

Verify Username Field Is Empty
    ${value}=    Get Value    ${USERNAME_FIELD}
    Should Be Empty    ${value}

Verify Password Field Is Empty
    ${value}=    Get Value    ${PASSWORD_FIELD}
    Should Be Empty    ${value}