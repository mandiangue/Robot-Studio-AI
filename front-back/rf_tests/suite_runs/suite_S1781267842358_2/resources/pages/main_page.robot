*** Settings ***
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_INPUT}    10s

Login With Credentials
    [Arguments]    ${user}    ${pass}
    Input Text    ${USERNAME_INPUT}    ${user}
    Input Text    ${PASSWORD_INPUT}    ${pass}
    Click Element    ${LOGIN_BUTTON}

Verify Inventory Page Displayed
    Wait Until Element Is Visible    ${INVENTORY_CONTAINER}    10s
    Location Should Contain    inventory

Select Sort Option
    [Arguments]    ${value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    10s
    Select From List By Value    ${SORT_DROPDOWN}    ${value}

Verify Prices Sorted Descending
    @{prices}=    Get WebElements    ${INVENTORY_ITEM_PRICE}
    @{values}=    Create List
    FOR    ${p}    IN    @{prices}
        ${txt}=    Get Text    ${p}
        ${num}=    Evaluate    float("${txt}".replace("$",""))
        Append To List    ${values}    ${num}
    END
    ${sorted}=    Evaluate    sorted(${values}, reverse=True)
    Should Be Equal    ${values}    ${sorted}

Add Product To Cart
    [Arguments]    ${locator}
    Wait Until Element Is Visible    ${locator}    10s
    Click Element    ${locator}

Verify Cart Badge Count
    [Arguments]    ${count}
    Wait Until Element Is Visible    ${CART_BADGE}    10s
    Element Text Should Be    ${CART_BADGE}    ${count}

Open Cart
    Click Element    ${CART_LINK}
    Wait Until Location Contains    cart    10s

Verify Cart Items Count
    [Arguments]    ${count}
    ${items}=    Get WebElements    ${CART_ITEM}
    Length Should Be    ${items}    ${count}

Remove Product From Cart
    [Arguments]    ${locator}
    Wait Until Element Is Visible    ${locator}    10s
    Click Element    ${locator}

Verify Cart Badge Not Visible
    Wait Until Page Does Not Contain Element    ${CART_BADGE}    10s

Start Checkout
    Wait Until Element Is Visible    ${CHECKOUT_BUTTON}    10s
    Click Element    ${CHECKOUT_BUTTON}

Click Continue
    Wait Until Element Is Visible    ${CONTINUE_BUTTON}    10s
    Click Element    ${CONTINUE_BUTTON}

Fill Checkout Information
    [Arguments]    ${first}    ${last}    ${zip}
    Wait Until Element Is Visible    ${FIRST_NAME_INPUT}    10s
    Input Text    ${FIRST_NAME_INPUT}    ${first}
    Input Text    ${LAST_NAME_INPUT}    ${last}
    Input Text    ${POSTAL_CODE_INPUT}    ${zip}

Click Finish
    Wait Until Element Is Visible    ${FINISH_BUTTON}    10s
    Click Element    ${FINISH_BUTTON}

Verify Error Message Contains
    [Arguments]    ${text}
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    10s
    Element Should Contain    ${ERROR_MESSAGE}    ${text}

Verify Order Confirmation
    Wait Until Element Is Visible    ${CONFIRMATION_HEADER}    10s
    Element Should Contain    ${CONFIRMATION_HEADER}    Thank you for your order