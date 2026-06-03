*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library    SeleniumLibrary
Resource    ../variables.robot

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

Verify Locked User Error Is Displayed
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    locked out

Select Sort Option
    [Arguments]    ${option_value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${raw}=    Get Text    ${el}
        ${price}=    Evaluate    float('${raw}'.replace('$','').strip())
        Append To List    ${prices}    ${price}
    END
    [Return]    ${prices}

Verify Prices Are Sorted Ascending
    ${prices}=    Get All Product Prices
    ${sorted_prices}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted_prices}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Go To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    ${CART_LIST}    timeout=10s

Remove Item From Cart
    Wait Until Element Is Visible    ${REMOVE_BUTTON}    timeout=10s
    Click Button    ${REMOVE_BUTTON}

Verify Cart Is Empty
    ${items}=    Get WebElements    css=.cart_item
    Length Should Be    ${items}    0

Verify Cart Badge Is Gone
    ${badges}=    Get WebElements    ${CART_BADGE}
    Length Should Be    ${badges}    0