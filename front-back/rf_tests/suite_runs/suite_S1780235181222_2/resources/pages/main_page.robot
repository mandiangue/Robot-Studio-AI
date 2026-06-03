*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Locked Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    ${text}=    Get Text    ${ERROR_MESSAGE}
    Should Be Equal As Strings    ${text}    ${LOCKED_ERROR}

Select Sort Option By Price Ascending
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${SORT_PRICE_ASC}

Verify Products Are Sorted By Price Ascending
    Wait Until Element Is Visible    css=.inventory_item_price    timeout=10s
    ${prices}=    Get WebElements    css=.inventory_item_price
    ${price_list}=    Create List
    FOR    ${price}    IN    @{prices}
        ${text}=    Get Text    ${price}
        ${value}=    Remove String    ${text}    $
        Append To List    ${price_list}    ${value}
    END
    ${sorted}=    Copy List    ${price_list}
    Sort List    ${sorted}
    Lists Should Be Equal    ${price_list}    ${sorted}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Go To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    ${CART_LIST}    timeout=10s

Remove Item From Cart
    Wait Until Element Is Visible    ${REMOVE_BTN}    timeout=10s
    Click Button    ${REMOVE_BTN}

Verify Cart Is Empty
    Wait Until Element Is Not Visible    ${REMOVE_BTN}    timeout=10s
    ${items}=    Get WebElements    css=.cart_item
    Length Should Be    ${items}    0
    ${badges}=    Get WebElements    ${CART_BADGE}
    Length Should Be    ${badges}    0