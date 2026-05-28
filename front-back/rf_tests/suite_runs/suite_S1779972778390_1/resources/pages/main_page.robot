*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Locked Error Message
    Wait Until Element Is Visible    ${ERROR_MSG}    timeout=10s
    ${msg}=    Get Text    ${ERROR_MSG}
    Should Contain    ${msg}    ${LOCKED_ERROR}

Verify Catalog Page Is Not Accessible
    Page Should Not Contain    css=.inventory_list

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Verify Cart Badge Is One
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    ${count}=    Get Text    ${CART_BADGE}
    Should Be Equal As Strings    ${count}    1

Verify Remove Button Is Visible
    Element Should Be Visible    ${REMOVE_BTN}

Select Sort Option Low To High
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    ${SORT_LOHI}

Verify Products Sorted By Price Low To High
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${prices}=    Get WebElements    ${PRODUCT_PRICES}
    ${price_list}=    Create List
    FOR    ${price}    IN    @{prices}
        ${text}=    Get Text    ${price}
        ${value}=    Evaluate    float("${text}".replace("$","").strip())
        Append To List    ${price_list}    ${value}
    END
    ${sorted_list}=    Evaluate    sorted(${price_list})
    Lists Should Be Equal    ${price_list}    ${sorted_list}