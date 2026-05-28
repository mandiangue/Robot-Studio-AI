*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for Saucedemo pages
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}

Fill Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Fill Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Get Error Message Text
    ${text}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${text}

Verify Locked User Error Is Displayed
    ${msg}=    Get Error Message Text
    Should Be Equal As Strings    ${msg}    ${LOCKED_ERROR_MSG}
    Page Should Not Contain Element    css=.inventory_container

Open First Product Detail Page
    Click Element    ${PRODUCT_LINK}

Click Add To Cart On Detail Page
    Click Button    ${ADD_TO_CART_BTN}

Verify Cart Badge Is One
    ${badge}=    Get Text    ${CART_BADGE}
    Should Be Equal As Strings    ${badge}    1

Verify Remove Button Is Displayed
    Page Should Contain Element    ${REMOVE_BTN}

Select Sort Option
    [Arguments]    ${option_value}
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices As Numbers
    ${elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${raw}=    Get Text    ${el}
        ${clean}=    Remove String    ${raw}    $
        ${num}=    Convert To Number    ${clean}
        Append To List    ${prices}    ${num}
    END
    [Return]    ${prices}

Verify Prices Are Sorted Ascending
    ${prices}=    Get All Product Prices As Numbers
    ${sorted}=    Evaluate    sorted(${prices})
    Lists Should Be Equal    ${prices}    ${sorted}