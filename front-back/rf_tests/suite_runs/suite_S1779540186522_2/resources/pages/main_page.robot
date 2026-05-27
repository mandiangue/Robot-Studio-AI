*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Main Page
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Main Page Should Be Displayed
    Wait Until Page Contains Element    ${PRODUCT_LIST}    timeout=10s
    Page Should Contain    Swag Labs

Add First Product To Cart
    Click Button    ${ADD_TO_CART_BUTTON}

Get Cart Badge Count
    ${count}=    Get Text    ${CART_BADGE}
    [Return]    ${count}

Cart Badge Should Show Count
    [Arguments]    ${expected_count}
    Wait Until Page Contains Element    ${CART_BADGE}    timeout=5s
    ${actual_count}=    Get Text    ${CART_BADGE}
    Should Be Equal    ${actual_count}    ${expected_count}

Click Cart Link
    Click Element    ${CART_LINK}