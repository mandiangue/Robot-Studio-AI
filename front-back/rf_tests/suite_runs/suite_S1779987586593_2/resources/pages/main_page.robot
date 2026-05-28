*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Fill Login Form
    [Arguments]    ${username}    ${password}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s
    Clear Element Text    ${USERNAME_FIELD}
    Input Text    ${USERNAME_FIELD}    ${username}
    Clear Element Text    ${PASSWORD_FIELD}
    Input Text    ${PASSWORD_FIELD}    ${password}
    Click Button    ${LOGIN_BUTTON}

Verify Locked Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    ${message}=    Get Text    ${ERROR_MESSAGE}
    Should Be Equal As Strings    ${message}    ${LOCKED_ERROR_TEXT}

Verify User Is On Inventory Page
    Wait Until Location Is    ${INVENTORY_PAGE_URL}    timeout=10s
    Wait Until Element Is Visible    css=.inventory_list    timeout=10s

Select Sort Option
    [Arguments]    ${option_value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Verify Products Are Sorted By Price Low To High
    Wait Until Element Is Visible    ${ALL_PRODUCT_PRICES}    timeout=10s
    ${price_elements}=    Get WebElements    ${ALL_PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${element}    IN    @{price_elements}
        ${text}=    Get Text    ${element}
        ${clean}=    Replace String    ${text}    $    ${EMPTY}
        ${value}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${value}
    END
    ${sorted_prices}=    Copy List    ${prices}
    Sort List    ${sorted_prices}
    Lists Should Be Equal    ${prices}    ${sorted_prices}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BUTTON}    timeout=10s
    Click Button    ${ADD_TO_CART_BUTTON}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s

Navigate To Cart Page
    Click Element    ${CART_ICON}
    Wait Until Location Is    ${CART_PAGE_URL}    timeout=10s
    Wait Until Element Is Visible    css=.cart_contents_container    timeout=10s

Remove Product From Cart
    Wait Until Element Is Visible    ${REMOVE_BUTTON}    timeout=10s
    Click Button    ${REMOVE_BUTTON}

Verify Cart Is Empty
    Wait Until Element Is Not Visible    ${CART_ITEM}    timeout=10s
    Element Should Not Be Visible    ${CART_BADGE}
    Page Should Not Contain Element    ${CART_ITEM}