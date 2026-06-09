*** Settings ***
Documentation    Page Object for SauceDemo pages
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    10s

Fill Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${USERNAME_FIELD}    ${username}
    Input Text    ${PASSWORD_FIELD}    ${password}
    Click Button    ${LOGIN_BUTTON}

Verify Error Message Is Displayed
    [Arguments]    ${message}
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    10s
    Element Text Should Be    ${ERROR_MESSAGE}    ${message}

Verify Products Page Is Loaded
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    10s

Select Sort Option Low To High
    Select From List By Value    ${SORT_DROPDOWN}    ${SORT_LOW_TO_HIGH}

Get All Product Prices
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    10s
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    [Return]    ${prices}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_FIRST}    10s
    Click Button    ${ADD_TO_CART_FIRST}

Go To Cart Page
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    ${CHECKOUT_BUTTON}    10s

Remove Product From Cart
    Wait Until Element Is Visible    ${REMOVE_BUTTON}    10s
    Click Button    ${REMOVE_BUTTON}

Verify Cart Is Empty
    Page Should Not Contain    ${CART_BADGE}
    Page Should Not Contain    css=.cart_item

Proceed To Checkout
    Click Button    ${CHECKOUT_BUTTON}
    Wait Until Element Is Visible    ${FIRST_NAME_FIELD}    10s

Fill Checkout Information
    [Arguments]    ${first}    ${last}    ${postal}
    Input Text    ${FIRST_NAME_FIELD}    ${first}
    Input Text    ${LAST_NAME_FIELD}    ${last}
    Input Text    ${POSTAL_CODE_FIELD}    ${postal}
    Click Button    ${CONTINUE_BUTTON}

Confirm Order
    Wait Until Element Is Visible    ${FINISH_BUTTON}    10s
    Click Button    ${FINISH_BUTTON}

Verify Order Confirmation
    Wait Until Element Is Visible    ${CONFIRMATION_MESSAGE}    10s
    Element Text Should Be    ${CONFIRMATION_MESSAGE}    ${CONFIRM_MSG}

Open Burger Menu
    Wait Until Element Is Visible    ${BURGER_MENU}    10s
    Click Element    ${BURGER_MENU}

Click Logout
    Wait Until Element Is Visible    ${LOGOUT_LINK}    10s
    Click Element    ${LOGOUT_LINK}

Verify Login Page Is Displayed
    Wait Until Element Is Visible    ${LOGIN_BUTTON}    10s
    Location Should Be    ${BASE_URL}/

Click First Product
    Wait Until Element Is Visible    ${FIRST_PRODUCT_NAME}    10s
    Click Element    ${FIRST_PRODUCT_NAME}

Verify Product Detail Page Is Displayed
    Wait Until Element Is Visible    ${PRODUCT_DETAIL_NAME}    10s
    Page Should Contain Element    ${PRODUCT_DETAIL_DESC}
    Page Should Contain Element    ${PRODUCT_DETAIL_PRICE}
    Page Should Contain Element    ${PRODUCT_DETAIL_BTN}

Verify Prices Are Sorted Low To High
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prev}=    Set Variable    ${0}
    FOR    ${el}    IN    @{elements}
        ${text}=    Get Text    ${el}
        ${value}=    Evaluate    float("${text}".replace("$",""))
        Should Be True    ${value} >= ${prev}
        ${prev}=    Set Variable    ${value}
    END