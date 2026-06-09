*** Settings ***
Documentation    Page Object for SauceDemo pages
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Fill Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${INPUT_USERNAME}    ${username}
    Input Text    ${INPUT_PASSWORD}    ${password}
    Click Button    ${BTN_LOGIN}

Verify Inventory Page Is Displayed
    Location Should Be    ${INVENTORY_URL}
    Page Should Contain Element    ${SORT_DROPDOWN}

Select Sort Option High To Low
    Select From List By Value    ${SORT_DROPDOWN}    hilo

Verify Products Sorted High To Low
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    ${prev}=    Set Variable    ${99999}
    FOR    ${element}    IN    @{prices}
        ${text}=    Get Text    ${element}
        ${value}=    Evaluate    float('${text}'.replace('$',''))
        Should Be True    ${value} <= ${prev}
        ${prev}=    Set Variable    ${value}
    END

Add Three Products To Cart
    Click Element    ${BTN_ADD_BACKPACK}
    Click Element    ${BTN_ADD_BIKE_LIGHT}
    Click Element    ${BTN_ADD_BOLT_SHIRT}

Verify Cart Badge Shows
    [Arguments]    ${count}
    Element Text Should Be    ${CART_BADGE}    ${count}

Add Two Products To Cart
    Click Element    ${BTN_ADD_BACKPACK}
    Click Element    ${BTN_ADD_BIKE_LIGHT}

Navigate To Cart Page
    Click Element    ${CART_LINK}
    Location Should Be    ${CART_URL}

Remove First Product From Cart
    Click Element    ${BTN_REMOVE_BACKPACK}

Verify Cart Badge Shows One
    Element Text Should Be    ${CART_BADGE}    1

Verify Cart Contains One Item
    ${items}=    Get WebElements    css=.cart_item
    Length Should Be    ${items}    1

Add One Product To Cart
    Click Element    ${BTN_ADD_BACKPACK}

Start Checkout Process
    Click Element    ${BTN_CHECKOUT}

Fill Checkout Information
    [Arguments]    ${firstname}    ${lastname}    ${postal}
    Input Text    ${INPUT_FIRSTNAME}    ${firstname}
    Input Text    ${INPUT_LASTNAME}     ${lastname}
    Input Text    ${INPUT_POSTAL}       ${postal}
    Click Element    ${BTN_CONTINUE}

Finish Order
    Click Element    ${BTN_FINISH}

Verify Order Confirmation
    Element Text Should Be    ${LABEL_COMPLETE}    Thank you for your order!

Open Hamburger Menu
    Click Element    ${BTN_HAMBURGER}

Click Logout
    Wait Until Element Is Visible    ${BTN_LOGOUT}
    Click Element    ${BTN_LOGOUT}

Verify Login Page Is Displayed
    Location Should Be    ${BASE_URL}/
    Page Should Contain Element    ${BTN_LOGIN}