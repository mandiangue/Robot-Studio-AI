*** Settings ***
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${URL}
    Wait Until Element Is Visible    ${LOGIN_BUTTON}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Element    ${LOGIN_BUTTON}

Verify Error Message Displayed
    [Arguments]    ${expected_text}
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Contain    ${ERROR_MESSAGE}    ${expected_text}

Verify Inventory Page Displayed
    Wait Until Element Is Visible    ${INVENTORY_CONTAINER}    timeout=10s

Select Sort Option
    [Arguments]    ${option}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Label    ${SORT_DROPDOWN}    ${option}

Verify Products Sorted By Price Descending
    @{prices}=    Get WebElements    ${PRODUCT_PRICE}
    @{values}=    Create List
    FOR    ${el}    IN    @{prices}
        ${text}=    Get Text    ${el}
        ${num}=    Evaluate    float("${text}".replace("$",""))
        Append To List    ${values}    ${num}
    END
    ${sorted}=    Evaluate    sorted(${values}, reverse=True)
    Should Be Equal    ${values}    ${sorted}

Add Product To Cart
    [Arguments]    ${locator}
    Click Element    ${locator}

Open Cart
    Click Element    ${CART_LINK}

Verify Cart Badge Count
    [Arguments]    ${expected_count}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Should Contain    ${CART_BADGE}    ${expected_count}

Verify Cart Items Count
    [Arguments]    ${expected_count}
    Wait Until Element Is Visible    ${CART_ITEM}    timeout=10s
    ${count}=    Get Element Count    ${CART_ITEM}
    Should Be Equal As Integers    ${count}    ${expected_count}

Click Checkout
    Wait Until Element Is Visible    ${CHECKOUT_BUTTON}    timeout=10s
    Click Element    ${CHECKOUT_BUTTON}

Fill Checkout Information
    [Arguments]    ${first}    ${last}    ${zip}
    Wait Until Element Is Visible    ${FIRST_NAME_INPUT}    timeout=10s
    Input Text    ${FIRST_NAME_INPUT}    ${first}
    Input Text    ${LAST_NAME_INPUT}    ${last}
    Input Text    ${POSTAL_CODE_INPUT}    ${zip}

Click Continue
    Click Element    ${CONTINUE_BUTTON}

Click Finish
    Wait Until Element Is Visible    ${FINISH_BUTTON}    timeout=10s
    Click Element    ${FINISH_BUTTON}

Verify Order Confirmation Displayed
    Wait Until Element Is Visible    ${COMPLETE_HEADER}    timeout=10s
    Element Should Contain    ${COMPLETE_HEADER}    Thank you for your order!