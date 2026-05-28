*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
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

Get Error Message Text
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    ${text}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${text}

Select Sort Option
    [Arguments]    ${option_value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices
    Wait Until Element Is Visible    css=.inventory_item_price    timeout=10s
    ${elements}=    Get WebElements    css=.inventory_item_price
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${raw}=    Get Text    ${el}
        ${clean}=    Remove String    ${raw}    $
        ${price}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${price}
    END
    [Return]    ${prices}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Go To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    ${CART_LIST}    timeout=10s

Remove Item From Cart
    Wait Until Element Is Visible    ${REMOVE_BTN}    timeout=10s
    Click Button    ${REMOVE_BTN}

Cart Badge Should Not Be Visible
    Run Keyword And Return Status    Element Should Not Be Visible    ${CART_BADGE}

Cart Should Be Empty
    Wait Until Element Is Visible    ${CART_LIST}    timeout=10s
    ${items}=    Get WebElements    css=.cart_item
    Length Should Be    ${items}    0