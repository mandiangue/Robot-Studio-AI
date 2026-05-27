*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Main Page Object
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Verify Products Are Displayed
    Wait Until Page Contains Element    ${INVENTORY_CONTAINER}    timeout=10s
    Page Should Contain Element    ${INVENTORY_CONTAINER}

Add Product To Cart
    [Arguments]    ${product_button_id}
    Click Button    ${product_button_id}

Get Cart Badge Count
    ${count}=    Get Text    ${CART_BADGE}
    [Return]    ${count}

Verify Cart Badge Shows Count
    [Arguments]    ${expected_count}
    Wait Until Page Contains Element    ${CART_BADGE}    timeout=5s
    ${actual_count}=    Get Text    ${CART_BADGE}
    Should Be Equal    ${actual_count}    ${expected_count}

Click Cart Link
    Click Element    ${CART_LINK}

Verify Product In Cart
    [Arguments]    ${product_name}
    Page Should Contain    ${product_name}

Click Checkout Button
    Click Button    ${CHECKOUT_BUTTON}

Fill Checkout Form
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Input Text    ${FIRST_NAME_FIELD}    ${first_name}
    Input Text    ${LAST_NAME_FIELD}    ${last_name}
    Input Text    ${POSTAL_CODE_FIELD}    ${postal_code}

Click Continue Button
    Click Button    ${CONTINUE_BUTTON}

Click Finish Button
    Click Button    ${FINISH_BUTTON}

Verify Order Confirmation
    Wait Until Page Contains Element    ${CONFIRMATION_MESSAGE}    timeout=10s
    Page Should Contain    ${EXPECTED_CONFIRMATION_TEXT}

Open Menu
    Click Button    ${MENU_BUTTON}

Click Logout Option
    Wait Until Page Contains Element    ${LOGOUT_OPTION}    timeout=5s
    Click Element    ${LOGOUT_OPTION}