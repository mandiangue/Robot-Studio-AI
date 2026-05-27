*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Checkout
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Click Checkout Button
    Click Button    ${CHECKOUT_BUTTON}
    Wait Until Page Contains    Checkout: Your Information    timeout=10s

Fill Shipping Information
    [Arguments]    ${first_name}    ${last_name}    ${postal_code}
    Input Text    ${FIRST_NAME_FIELD}    ${first_name}
    Input Text    ${LAST_NAME_FIELD}    ${last_name}
    Input Text    ${POSTAL_CODE_FIELD}    ${postal_code}

Click Continue Button
    Click Button    ${CONTINUE_BUTTON}
    Wait Until Page Contains    Checkout: Overview    timeout=10s

Click Finish Button
    Click Button    ${FINISH_BUTTON}

Verify Order Confirmation
    Wait Until Page Contains    ${ORDER_CONFIRMATION_TITLE}    timeout=10s
    Page Should Contain    Order dispatched

Close Browser Session