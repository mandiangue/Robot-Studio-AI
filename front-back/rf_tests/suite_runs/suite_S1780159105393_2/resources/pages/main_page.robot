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

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Error Message Is Displayed With Text
    [Arguments]    ${expected_text}
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Text Should Be    ${ERROR_MESSAGE}    ${expected_text}

Select Sort Option
    [Arguments]    ${option_value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${price_elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${element}    IN    @{price_elements}
        ${text}=    Get Text    ${element}
        ${value}=    Evaluate    float("${text}".replace("$","").strip())
        Append To List    ${prices}    ${value}
    END
    RETURN    ${prices}

Prices Are Sorted Low To High
    ${prices}=    Get All Product Prices
    ${sorted_prices}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted_prices}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Go To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    css=.cart_contents_container    timeout=10s

Remove Item From Cart
    Wait Until Element Is Visible    ${REMOVE_BUTTON}    timeout=10s
    Click Button    ${REMOVE_BUTTON}

Cart Is Empty
    ${items}=    Get WebElements    ${CART_ITEMS}
    Should Be Empty    ${items}

Cart Badge Is Not Visible
    ${badges}=    Get WebElements    ${CART_BADGE}
    Length Should Be    ${badges}    0