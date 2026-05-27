*** Settings ***
Suite Setup       Go To    ${LOGIN_PAGE_TITLE}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object Model for Main Pages - SauceDemo Application
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Open Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${SELECTOR_USERNAME_INPUT}    timeout=10s

Verify Login Page Is Displayed
    Title Should Be    ${LOGIN_PAGE_TITLE}
    Page Should Contain Element    ${SELECTOR_USERNAME_INPUT}
    Page Should Contain Element    ${SELECTOR_PASSWORD_INPUT}

Input Username
    [Arguments]    ${username}
    Input Text    ${SELECTOR_USERNAME_INPUT}    ${username}

Input Password
    [Arguments]    ${password}
    Input Text    ${SELECTOR_PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${SELECTOR_LOGIN_BUTTON}

Verify Products Page Is Displayed
    Wait Until Element Is Visible    xpath=//span[text()='Products']    timeout=10s
    Page Should Contain Element    class:inventory_item

Select Product By Name
    [Arguments]    ${product_name}
    Wait Until Element Is Visible    xpath=//div[contains(text(), '${product_name}')]    timeout=10s
    Element Should Be Visible    xpath=//div[contains(text(), '${product_name}')]

Click Add To Cart Button
    Click Button    ${SELECTOR_PRODUCT_ADD_BUTTON}
    Wait Until Element Is Visible    ${SELECTOR_CART_BADGE}    timeout=10s

Verify Cart Badge Shows Correct Count
    [Arguments]    ${expected_count}
    Element Should Contain    ${SELECTOR_CART_BADGE}    ${expected_count}

Click Cart Link
    Click Element    ${SELECTOR_CART_LINK}
    Wait Until Element Is Visible    ${SELECTOR_CHECKOUT_BUTTON}    timeout=10s

Verify Cart Page Is Displayed
    Page Should Contain Element    ${SELECTOR_CHECKOUT_BUTTON}

Click Checkout Button
    Click Button    ${SELECTOR_CHECKOUT_BUTTON}
    Wait Until Element Is Visible    ${SELECTOR_FIRST_NAME_INPUT}    timeout=10s

Verify Checkout Information Page Is Displayed
    Page Should Contain Element    ${SELECTOR_FIRST_NAME_INPUT}
    Page Should Contain Element    ${SELECTOR_LAST_NAME_INPUT}
    Page Should Contain Element    ${SELECTOR_POSTAL_CODE_INPUT}

Input First Name
    [Arguments]    ${first_name}
    Input Text    ${SELECTOR_FIRST_NAME_INPUT}    ${first_name}

Input Last Name
    [Arguments]    ${last_name}
    Input Text    ${SELECTOR_LAST_NAME_INPUT}    ${last_name}

Input Postal Code
    [Arguments]    ${postal_code}
    Input Text    ${SELECTOR_POSTAL_CODE_INPUT}    ${postal_code}

Click Continue Button
    Click Button    ${SELECTOR_CONTINUE_BUTTON}
    Wait Until Element Is Visible    ${SELECTOR_FINISH_BUTTON}    timeout=10s

Verify Checkout Overview Page Is Displayed
    Page Should Contain Element    ${SELECTOR_FINISH_BUTTON}
    Page Should Contain Element    xpath=//div[@class='summary_info']

Click Finish Button
    Click Button    ${SELECTOR_FINISH_BUTTON}
    Wait Until Element Is Visible    ${SELECTOR_CONFIRMATION_MESSAGE}    timeout=10s

Verify Order Confirmation Is Displayed
    Element Should Be Visible    ${SELECTOR_CONFIRMATION_MESSAGE}
    Page Should Contain Text    Thank you for your order

Get Order Confirmation Number
    ${confirmation_text}    Get Text    xpath=//div[@class='complete-header']
    [Return]    ${confirmation_text}

Click Menu Button
    Click Button    ${SELECTOR_MENU_BUTTON}
    Wait Until Element Is Visible    ${SELECTOR_LOGOUT_LINK}    timeout=10s

Click Logout Link
    Click Element    ${SELECTOR_LOGOUT_LINK}
    Wait Until Element Is Visible    ${SELECTOR_LOGIN_BUTTON}    timeout=10s

Verify User Is Back On Login Page
    Title Should Be    ${LOGIN_PAGE_TITLE}
    Page Should Contain Element    ${SELECTOR_LOGIN_BUTTON}

Close Browser Session