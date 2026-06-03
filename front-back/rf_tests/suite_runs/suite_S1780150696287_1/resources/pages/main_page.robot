*** Settings ***
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main
Library          SeleniumLibrary
Resource         ../variables.robot

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

Verify Locked Error Message Is Displayed
    ${msg}=    Get Error Message Text
    Should Contain    ${msg}    Sorry, this user has been locked out

Select Sort Option
    [Arguments]    ${option_value}
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices As Numbers
    ${price_elements}=    Get WebElements    ${PRODUCT_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{price_elements}
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

Click Add To Cart Backpack
    Click Button    ${BACKPACK_BTN}

Click Cart Icon
    Click Element    ${CART_ICON}

Verify Cart Badge Count
    [Arguments]    ${expected_count}
    ${badge_text}=    Get Text    ${CART_BADGE}
    Should Be Equal As Strings    ${badge_text}    ${expected_count}

Verify Cart Contains Backpack
    ${item_name}=    Get Text    ${CART_ITEM_NAME}
    Should Be Equal As Strings    ${item_name}    Sauce Labs Backpack

Verify Cart Item Price
    ${price_text}=    Get Text    ${CART_ITEM_PRICE}
    Should Contain    ${price_text}    $