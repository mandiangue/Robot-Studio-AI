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
    [Return]    ${text}

Select Sort Option
    [Arguments]    ${option_value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    [Return]    ${prices}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Go To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    css=.cart_contents_container    timeout=10s

Remove Product From Cart
    Wait Until Element Is Visible    ${REMOVE_BUTTON}    timeout=10s
    Click Button    ${REMOVE_BUTTON}

Cart Badge Should Not Be Visible
    Page Should Not Contain Element    ${CART_BADGE}

Cart Should Be Empty
    Page Should Not Contain Element    ${CART_ITEM}