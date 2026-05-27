*** Settings ***
Suite Setup       Go To    ${LOGIN_INPUT_USERNAME}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Sauce Demo Main Pages
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Sauce Demo Website

    Maximize Browser Window

Close Browser Session


Enter Username
    [Arguments]    ${username}
    Input Text    ${LOGIN_INPUT_USERNAME}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${LOGIN_INPUT_PASSWORD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Wait For Inventory Page
    Wait Until Element Is Visible    ${INVENTORY_CONTAINER}    10s

Click Add To Cart For First Product
    Click Button    ${ADD_TO_CART_BUTTON}

Get Cart Badge Count
    ${count}=    Get Text    ${CART_BADGE}
    [Return]    ${count}

Select Sort Option By Price Ascending
    Click Element    ${SORT_DROPDOWN}
    Click Element    ${SORT_PRICE_ASC}
    Sleep    1s

Wait For Products Sorted
    Sleep    2s

Click Cart Icon
    Click Element    ${CART_ICON}

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

Verify Order Confirmation
    Wait Until Element Is Visible    ${CONFIRMATION_MESSAGE}    10s
    Element Should Contain    ${CONFIRMATION_MESSAGE}    ${EXPECTED_CONFIRMATION_TEXT}

Verify Product Added To Cart
    ${badge_count}=    Get Text    ${CART_BADGE}
    Should Be Equal    ${badge_count}    1

Get Product Prices List
    ${prices}=    Get WebElements    xpath=//div[@class='inventory_item_price']
    [Return]    ${prices}