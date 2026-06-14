*** Settings ***
Documentation    Page Object Main
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${LOGIN_BUTTON}    10s

Enter Credentials
    [Arguments]    ${username}    ${password}
    Input Text       ${USERNAME_INPUT}    ${username}
    Input Password   ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Element    ${LOGIN_BUTTON}

Verify Inventory Page Displayed
    Wait Until Element Is Visible    ${INVENTORY_CONTAINER}    10s
    Location Should Contain    inventory.html

Select Sort Option
    [Arguments]    ${option}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    10s
    Select From List By Label    ${SORT_DROPDOWN}    ${option}

Verify Products Sorted High To Low
    @{prices}=    Get WebElements    ${INVENTORY_ITEM_PRICE}
    ${first_price_text}=    Get Text    @{prices}[0]
    ${last_price_text}=     Get Text    @{prices}[-1]
    ${first}=    Evaluate    float("${first_price_text}".replace("$",""))
    ${last}=     Evaluate    float("${last_price_text}".replace("$",""))
    Should Be True    ${first} >= ${last}

Add Backpack To Cart
    Wait Until Element Is Visible    ${ADD_BACKPACK_BTN}    10s
    Click Element    ${ADD_BACKPACK_BTN}

Open Cart Page
    Click Element    ${CART_LINK}
    Wait Until Location Contains    cart.html    10s

Remove Backpack From Cart
    Wait Until Element Is Visible    ${REMOVE_BACKPACK_BTN}    10s
    Click Element    ${REMOVE_BACKPACK_BTN}

Verify Cart Badge Not Visible
    Wait Until Page Does Not Contain Element    ${CART_BADGE}    10s

Open Burger Menu
    Wait Until Element Is Visible    ${BURGER_MENU_BTN}    10s
    Click Element    ${BURGER_MENU_BTN}

Click Logout Link
    Wait Until Element Is Visible    ${LOGOUT_LINK}    10s
    Click Element    ${LOGOUT_LINK}

Verify Login Page Displayed
    Wait Until Element Is Visible    ${LOGIN_BUTTON}    10s

Click Checkout Button
    Wait Until Element Is Visible    ${CHECKOUT_BUTTON}    10s
    Click Element    ${CHECKOUT_BUTTON}

Fill Checkout Information
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Wait Until Element Is Visible    ${FIRST_NAME_INPUT}    10s
    Input Text    ${FIRST_NAME_INPUT}     ${first_name}
    Input Text    ${LAST_NAME_INPUT}      ${last_name}
    Input Text    ${POSTAL_CODE_INPUT}    ${postal_code}

Click Continue Button
    Click Element    ${CONTINUE_BUTTON}

Click Finish Button
    Wait Until Element Is Visible    ${FINISH_BUTTON}    10s
    Click Element    ${FINISH_BUTTON}

Verify Order Confirmation Displayed
    Wait Until Element Is Visible    ${CONFIRMATION_HEADER}    10s
    Element Text Should Be    ${CONFIRMATION_HEADER}    Thank you for your order!

Verify First Name Error Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    10s
    Element Text Should Contain    ${ERROR_MESSAGE}    First Name is required