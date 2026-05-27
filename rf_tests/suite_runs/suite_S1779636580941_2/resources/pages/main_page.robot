*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_USERNAME_INPUT}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for Main and Checkout flows
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Sauce Demo Application

    Maximize Browser Window
    Wait Until Page Contains Element    ${LOGIN_USERNAME_INPUT}    10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${LOGIN_USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${LOGIN_PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Product List Is Displayed
    Wait Until Page Contains Element    ${PRODUCT_LIST}    10s
    Page Should Contain Element    ${PRODUCT_LIST}

Click Add To Cart Button
    Click Button    ${ADD_TO_CART_BUTTON}

Verify Item Count In Cart Badge
    [Arguments]    ${expected_count}
    Wait Until Page Contains Element    ${CART_BADGE}    10s
    Element Text Should Be    ${CART_BADGE}    ${expected_count}

Get First Product Price
    Wait Until Page Contains Element    ${PRODUCT_PRICE}    10s
    ${price}=    Get Text    ${PRODUCT_PRICE}
    [Return]    ${price}

Click Cart Link
    Click Element    ${CART_LINK}

Click Checkout Button
    Click Button    ${CHECKOUT_BUTTON}

Enter First Name
    [Arguments]    ${first_name}
    Input Text    ${FIRST_NAME_INPUT}    ${first_name}

Enter Last Name
    [Arguments]    ${last_name}
    Input Text    ${LAST_NAME_INPUT}    ${last_name}

Enter Postal Code
    [Arguments]    ${postal_code}
    Input Text    ${POSTAL_CODE_INPUT}    ${postal_code}

Click Continue Button
    Click Button    ${CONTINUE_BUTTON}

Click Finish Button
    Click Button    ${FINISH_BUTTON}

Verify Order Confirmation Is Displayed
    Wait Until Page Contains Element    ${CONFIRMATION_MESSAGE}    10s
    Page Should Contain Element    ${CONFIRMATION_MESSAGE}
    Page Should Contain    Thank you for your order

Close Browser Session