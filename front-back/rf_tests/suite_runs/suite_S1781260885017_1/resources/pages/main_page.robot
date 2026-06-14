*** Settings ***
Documentation    Page Object Main for SauceDemo
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${LOGIN_BUTTON}    timeout=10s

Submit Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${USERNAME_INPUT}    ${username}
    Input Text    ${PASSWORD_INPUT}    ${password}
    Click Button    ${LOGIN_BUTTON}

Verify Locked Error Message
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    ${msg}=    Get Text    ${ERROR_MESSAGE}
    Should Contain    ${msg}    locked out

Verify Inventory Page Loaded
    Wait Until Element Is Visible    ${INVENTORY_CONTAINER}    timeout=10s

Select Sort Option
    [Arguments]    ${value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${value}

Verify Products Sorted High To Low
    @{prices}=    Get WebElements    ${INVENTORY_ITEM_PRICE}
    @{values}=    Create List
    FOR    ${el}    IN    @{prices}
        ${text}=    Get Text    ${el}
        ${num}=    Evaluate    float("${text}".replace("$",""))
        Append To List    ${values}    ${num}
    END
    ${sorted}=    Evaluate    sorted(${values}, reverse=True)
    Should Be Equal    ${values}    ${sorted}

Add Three Products To Cart
    Click Button    ${ADD_BACKPACK}
    Click Button    ${ADD_BIKE_LIGHT}
    Click Button    ${ADD_BOLT_TSHIRT}

Add Single Product To Cart
    Click Button    ${ADD_BACKPACK}

Verify Cart Badge Equals
    [Arguments]    ${count}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    ${text}=    Get Text    ${CART_BADGE}
    Should Be Equal As Strings    ${text}    ${count}

Open Cart Page
    Click Element    ${CART_LINK}
    Wait Until Location Contains    cart.html    timeout=10s

Verify Cart Items Count
    [Arguments]    ${count}
    ${items}=    Get WebElements    ${CART_ITEM}
    Length Should Be    ${items}    ${count}

Remove Product From Cart
    Click Button    ${REMOVE_BACKPACK_CART}

Verify Cart Badge Not Visible
    Wait Until Page Does Not Contain Element    ${CART_BADGE}    timeout=10s

Proceed To Checkout
    Click Element    ${CHECKOUT_BUTTON}
    Wait Until Element Is Visible    ${FIRST_NAME_INPUT}    timeout=10s

Fill Checkout Information
    [Arguments]    ${first}    ${last}    ${zip}
    Input Text    ${FIRST_NAME_INPUT}    ${first}
    Input Text    ${LAST_NAME_INPUT}    ${last}
    Input Text    ${POSTAL_CODE_INPUT}    ${zip}
    Click Element    ${CONTINUE_BUTTON}

Finish Order
    Wait Until Element Is Visible    ${FINISH_BUTTON}    timeout=10s
    Click Element    ${FINISH_BUTTON}

Verify Order Confirmation
    Wait Until Element Is Visible    ${COMPLETE_HEADER}    timeout=10s
    ${text}=    Get Text    ${COMPLETE_HEADER}
    Should Contain    ${text}    Thank you for your order

Open Side Menu
    Wait Until Element Is Visible    ${MENU_BUTTON}    timeout=10s
    Click Element    ${MENU_BUTTON}
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=10s

Click Logout
    Click Element    ${LOGOUT_LINK}

Verify Login Page Displayed
    Wait Until Element Is Visible    ${LOGIN_BUTTON}    timeout=10s