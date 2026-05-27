*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Submit Login
    Click Button    ${LOGIN_BUTTON}

Error Message Is Visible
    Element Should Be Visible    ${ERROR_MESSAGE}

Error Message Contains Locked Text
    Element Text Should Be    ${ERROR_MESSAGE}    Epic sadface: Sorry, this user has been locked out.

Click Add To Cart Button
    Click Button    ${ADD_TO_CART_BTN}

Cart Badge Shows Count
    [Arguments]    ${expected_count}
    Element Text Should Be    ${CART_BADGE}    ${expected_count}

Product Button Shows Remove
    Element Text Should Be    ${REMOVE_BTN}    Remove

Select Sort Option Price Low To High
    Select From List By Value    ${SORT_DROPDOWN}    ${SORT_PRICE_LOW}

Get All Product Prices
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    [Return]    ${prices}

Products Are Sorted By Price Ascending
    ${price_elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${price_list}=    Create List
    FOR    ${el}    IN    @{price_elements}
        ${text}=    Get Text    ${el}
        ${value}=    Evaluate    float("${text}".replace("$",""))
        Append To List    ${price_list}    ${value}
    END
    ${sorted_list}=    Evaluate    sorted(${price_list})
    Lists Should Be Equal    ${price_list}    ${sorted_list}