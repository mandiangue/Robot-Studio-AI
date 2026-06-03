*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library    SeleniumLibrary
Resource    ../variables.robot

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

Get Error Message Text
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    ${text}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${text}

Verify Locked User Error Is Displayed
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    locked out

Select Sort Option
    [Arguments]    ${option_value}
    Wait Until Element Is Visible    ${SORT_DROPDOWN}    timeout=10s
    Select From List By Value    ${SORT_DROPDOWN}    lohi

Get All Product Prices As Numbers
    Wait Until Element Is Visible    ${PRODUCT_PRICES}    timeout=10s
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${raw}=    Get Text    ${el}
        ${clean}=    Remove String    ${raw}    $
        ${num}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${num}
    END
    [Return]    ${prices}

Verify Prices Are Sorted Low To High
    ${prices}=    Get All Product Prices As Numbers
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}

Add First Product To Cart
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button    ${ADD_TO_CART_BTN}

Go To Cart
    Click Element    ${CART_ICON}
    Wait Until Element Is Visible    css=.cart_contents_container    timeout=10s

Remove Product From Cart
    Wait Until Element Is Visible    ${REMOVE_BTN}    timeout=10s
    Click Button    ${REMOVE_BTN}

Verify Cart Is Empty
    ${items}=    Get Element Count    ${CART_ITEMS}
    Should Be Equal As Integers    ${items}    0
    ${badge_count}=    Get Element Count    ${CART_BADGE}
    Should Be Equal As Integers    ${badge_count}    0