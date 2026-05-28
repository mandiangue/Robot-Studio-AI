*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Main - SauceDemo
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

Login With Credentials
    [Arguments]    ${username}    ${password}
    Open Login Page
    Fill Username    ${username}
    Fill Password    ${password}
    Click Login Button

Get Error Message Text
    ${text}=    Get Text    ${ERROR_MESSAGE}
    [Return]    ${text}

Error Message Should Contain
    [Arguments]    ${expected_text}
    Element Should Be Visible    ${ERROR_MESSAGE}
    ${text}=    Get Text    ${ERROR_MESSAGE}
    Should Contain    ${text}    ${expected_text}

Select Sort Option
    [Arguments]    ${option_value}
    Select From List By Value    ${SORT_DROPDOWN}    ${option_value}

Get First Product Price
    ${price_text}=    Get Text    ${FIRST_PRICE}
    [Return]    ${price_text}

Get All Product Prices
    ${prices}=    Get WebElements    ${FIRST_PRICE}
    [Return]    ${prices}

Add First Product To Cart
    Click Button    ${ADD_TO_CART_BTN}

Go To Cart
    Click Element    ${CART_ICON}

Cart Badge Should Not Be Visible
    Element Should Not Be Visible    ${CART_BADGE}

Cart Should Be Empty
    Page Should Not Contain Element    ${CART_ITEM}

Remove Product From Cart
    Click Button    ${REMOVE_BTN}