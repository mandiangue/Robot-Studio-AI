*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object — SauceDemo all pages actions and verifications
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Browser To Login Page

    Maximize Browser Window
    Title Should Be    Swag Labs

Fill Login Form
    [Arguments]    ${username}    ${password}
    Input Text    ${USERNAME_FIELD}    ${username}
    Input Text    ${PASSWORD_FIELD}    ${password}
    Click Button    ${LOGIN_BUTTON}

Verify Locked Out Error Is Displayed
    Element Should Be Visible    ${ERROR_MESSAGE}
    Element Text Should Be       ${ERROR_MESSAGE}    Epic sadface: Sorry, this user has been locked out.

Verify User Is On Products Page
    Location Should Contain    /inventory.html
    Title Should Be            Swag Labs

Sort Products By Price Low To High
    Select From List By Value    ${SORT_DROPDOWN}    lohi

Verify Products Are Sorted By Price Ascending
    ${prices_elements}    Get WebElements    ${PRODUCT_PRICES}
    ${prices}    Create List
    FOR    ${el}    IN    @{prices_elements}
        ${text}    Get Text    ${el}
        ${value}    Evaluate    float("${text}".replace("$",""))
        Append To List    ${prices}    ${value}
    END
    ${sorted_prices}    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted_prices}

Add First Product To Cart
    Click Button    ${ADD_TO_CART_FIRST}

Go To Cart
    Click Element    ${CART_ICON}
    Location Should Contain    /cart.html

Click Checkout
    Click Element    ${CHECKOUT_BUTTON}
    Location Should Contain    /checkout-step-one.html

Fill Shipping Information
    [Arguments]    ${firstname}    ${lastname}    ${postalcode}
    Input Text    ${FIRSTNAME_FIELD}    ${firstname}
    Input Text    ${LASTNAME_FIELD}     ${lastname}
    Input Text    ${POSTALCODE_FIELD}   ${postalcode}
    Click Element    ${CONTINUE_BUTTON}

Confirm Order
    Location Should Contain    /checkout-step-two.html
    Click Element    ${FINISH_BUTTON}

Verify Order Confirmation Is Displayed
    Location Should Contain    /checkout-complete.html
    Element Should Be Visible  ${CONFIRM_HEADER}
    Element Text Should Be     ${CONFIRM_HEADER}    Thank you for your order!

Close Test Browser