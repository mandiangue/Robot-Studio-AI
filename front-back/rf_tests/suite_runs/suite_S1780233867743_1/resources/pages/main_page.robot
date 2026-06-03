*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Fill Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${USERNAME_FIELD}    ${username}
    Input Text    ${PASSWORD_FIELD}    ${password}
    Click Button    ${LOGIN_BUTTON}

Error Message Is Visible
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Be Visible    ${ERROR_MESSAGE}

Error Message Contains Locked Text
    ${text}=    Get Text    ${ERROR_MESSAGE}
    Should Contain    ${text}    locked

Products Page Is Loaded
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Element Should Be Visible    ${SORT_DROPDOWN}

Select Sort Option
    [Arguments]    ${option_value}
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Products Are Sorted By Price Ascending
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    ${price_values}=    Create List
    FOR    ${price}    IN    @{prices}
        ${text}=    Get Text    ${price}
        ${value}=    Evaluate    float('${text}'.replace('$','').strip())
        Append To List    ${price_values}    ${value}
    END
    ${sorted}=    Evaluate    sorted(${price_values})
    Lists Should Be Equal    ${price_values}    ${sorted}

Add First Product To Cart
    ${buttons}=    Get WebElements    ${ADD_TO_CART_BTN}
    Click Element    ${buttons}[0]

Go To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    css=.cart_contents_container    timeout=10s

Remove Item From Cart
    Wait Until Element Is Visible    ${REMOVE_BTN}    timeout=10s
    Click Element    ${REMOVE_BTN}

Cart Is Empty
    Wait Until Element Is Not Visible    css=.cart_item    timeout=10s
    Page Should Not Contain Element    ${CART_ITEMS}

Cart Badge Is Not Visible
    Page Should Not Contain Element    ${CART_BADGE}