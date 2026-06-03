*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Fill Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${USERNAME_FIELD}    ${username}
    Input Text    ${PASSWORD_FIELD}    ${password}

Submit Login Form
    Click Button    ${LOGIN_BUTTON}

Verify Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Be Visible        ${ERROR_MESSAGE}
    Element Should Contain           ${ERROR_MESSAGE}    Epic sadface: Sorry, this user has been locked out

Verify Inventory Page Is Loaded
    Wait Until Element Is Visible    css=.inventory_list    timeout=10s
    Location Should Contain          inventory

Select Sort Option
    [Arguments]    ${option_value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value        ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices As Numbers
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${price_elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=            Create List
    FOR    ${elem}    IN    @{price_elements}
        ${text}=    Get Text    ${elem}
        ${text}=    Remove String    ${text}    $
        ${number}=    Convert To Number    ${text}
        Append To List    ${prices}    ${number}
    END
    [Return]    ${prices}

Verify Prices Are Sorted Ascending
    [Arguments]    ${prices}
    ${sorted_prices}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted_prices}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Verify Cart Badge Count
    [Arguments]    ${expected_count}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Should Contain           ${CART_BADGE}    ${expected_count}

Open Cart Page
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    ${CART_CONTAINER}    timeout=10s

Remove Product From Cart
    Wait Until Element Is Visible    ${REMOVE_BTN}    timeout=10s
    Click Button    ${REMOVE_BTN}

Verify Cart Is Empty
    Wait Until Element Is Not Visible    ${CART_BADGE}    timeout=10s
    Page Should Not Contain Element      ${CART_ITEMS}