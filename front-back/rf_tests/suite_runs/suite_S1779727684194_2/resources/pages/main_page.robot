*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
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
    RETURN    ${text}

Select Sort Option By Value
    [Arguments]    ${value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    lohi

Get All Product Prices As Numbers
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${text}=    Get Text    ${el}
        ${clean}=    Remove String    ${text}    $
        ${num}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${num}
    END
    RETURN    ${prices}

Add First Product To Cart
    Wait Until Element Is Visible    css=.btn_inventory    timeout=10s
    ${buttons}=    Get WebElements    css=.btn_inventory
    Click Element    ${buttons}[0]

Navigate To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    css=.cart_contents_container    timeout=10s

Remove Item From Cart
    Wait Until Element Is Visible    ${REMOVE_BTN}    timeout=10s
    Click Button    ${REMOVE_BTN}

Cart Is Empty
    ${items}=    Get WebElements    ${CART_ITEMS}
    Length Should Be    ${items}    0

Cart Badge Is Not Visible
    Element Should Not Be Visible    ${CART_BADGE}