*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for SauceDemo — Login, Inventory and Cart pages
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Browser To Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Fill Username Field
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password Field
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Inventory Page Is Displayed
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Location Should Be    ${INVENTORY_URL}

Select Sort Option Low To High
    Select From List By Value    ${SORT_DROPDOWN}    lohi

Get All Product Prices As Numbers
    ${price_elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${element}    IN    @{price_elements}
        ${text}=    Get Text    ${element}
        ${clean}=    Remove String    ${text}    $
        ${number}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${number}
    END
    RETURN    ${prices}

Verify Prices Are Sorted Low To High
    ${prices}=    Get All Product Prices As Numbers
    ${sorted_prices}=    Copy List    ${prices}
    Sort List    ${sorted_prices}
    Lists Should Be Equal    ${prices}    ${sorted_prices}

Add First Product To Cart
    Click Button    ${ADD_TO_CART_FIRST}

Verify Cart Badge Shows One
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=5s
    Element Text Should Be    ${CART_BADGE}    1

Click Cart Icon
    Click Element    ${CART_ICON}

Verify Cart Page Is Displayed
    Wait Until Element Is Visible    ${CART_ITEM}    timeout=10s
    Location Should Be    ${CART_URL}

Click Remove Button In Cart
    Wait Until Element Is Visible    ${REMOVE_BUTTON}    timeout=5s
    Click Button    ${REMOVE_BUTTON}

Verify Cart Is Empty
    Wait Until Element Is Not Visible    ${CART_ITEM}    timeout=5s
    Page Should Not Contain Element    ${CART_ITEM}

Verify Cart Badge Is Gone
    Page Should Not Contain Element    ${CART_BADGE}

Click Burger Menu
    Click Element    ${BURGER_MENU}
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=5s

Click Logout Link
    Click Element    ${LOGOUT_LINK}

Verify Login Page Is Displayed After Logout
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s
    Wait Until Element Is Visible    ${PASSWORD_FIELD}    timeout=10s
    Location Should Be    ${LOGIN_URL}/
    ${username_value}=    Get Value    ${USERNAME_FIELD}
    ${password_value}=    Get Value    ${PASSWORD_FIELD}
    Should Be Empty    ${username_value}
    Should Be Empty    ${password_value}

Close Test Browser