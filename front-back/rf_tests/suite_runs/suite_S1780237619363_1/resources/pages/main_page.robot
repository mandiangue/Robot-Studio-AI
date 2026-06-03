*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Login Page
    Go To    ${BASE_URL}

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Get Error Message Text
    ${text}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${text}

Select Sort Option
    [Arguments]    ${option_value}
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get All Product Prices
    ${elements}=    Get WebElements    ${INVENTORY_PRICES}
    ${prices}=    Create List
    FOR    ${el}    IN    @{elements}
        ${text}=    Get Text    ${el}
        ${price}=    Evaluate    float("${text}".replace("$","").strip())
        Append To List    ${prices}    ${price}
    END
    [Return]    ${prices}

Click First Add To Cart Button
    Click Button    ${ADD_TO_CART_BTN}

Go To Cart Page
    Click Element    ${CART_ICON}

Click Remove Button In Cart
    Click Button    ${REMOVE_BTN}

Cart Badge Should Not Be Visible
    Element Should Not Be Visible    ${CART_BADGE}

Cart Should Be Empty
    Page Should Not Contain    ${CART_ITEM}