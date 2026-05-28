*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for SauceDemo pages
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Clear Element Text    ${USERNAME_FIELD}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Clear Element Text    ${PASSWORD_FIELD}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Inventory Page Is Displayed
    Wait Until Element Is Visible    ${INVENTORY_LIST}    timeout=10s
    Element Should Be Visible    ${INVENTORY_LIST}

Verify Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Be Visible    ${ERROR_MESSAGE}

Verify Error Message Text Contains
    [Arguments]    ${text}
    Element Text Should Contain    ${ERROR_MESSAGE}    ${text}

Verify User Stays On Login Page
    Location Should Contain    saucedemo.com
    Element Should Be Visible    ${LOGIN_BUTTON}

Click Add To Cart First Product
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Verify Cart Badge Displays
    [Arguments]    ${expected_count}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Text Should Be    ${CART_BADGE}    ${expected_count}

Verify Remove Button Is Displayed
    Element Text Should Be    ${REMOVE_BTN}    Remove

Select Sort Option Low To High
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${SORT_LOW_HIGH}

Verify Products Sorted By Price Low To High
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    ${prev}=    Set Variable    ${0}
    FOR    ${price_elem}    IN    @{prices}
        ${text}=    Get Text    ${price_elem}
        ${value}=    Evaluate    float('${text}'.replace('$',''))
        Should Be True    ${value} >= ${prev}
        ${prev}=    Set Variable    ${value}
    END