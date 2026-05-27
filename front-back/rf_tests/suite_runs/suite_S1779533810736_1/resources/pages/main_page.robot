*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Main Page Object for SauceDemo
Library    SeleniumLibrary
Resource    ../variables.robot

*** Keywords ***
Navigate To Login Page

    Maximize Browser Window

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_INPUT}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_INPUT}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Products List Is Displayed
    Wait Until Element Is Visible    ${INVENTORY_CONTAINER}    timeout=10s
    Element Should Be Visible    ${INVENTORY_CONTAINER}

Click Add To Cart For First Product
    Click Button    ${PRODUCT_ADD_BUTTON_1}

Click Add To Cart For Second Product
    Click Button    ${PRODUCT_ADD_BUTTON_2}

Verify Cart Badge Shows Count
    [Arguments]    ${expected_count}
    Wait Until Element Contains    ${CART_BADGE}    ${expected_count}    timeout=10s

Click Cart Icon
    Click Element    ${CART_ICON}

Click Checkout Button
    Click Button    ${CHECKOUT_BUTTON}

Enter First Name
    [Arguments]    ${first_name}
    Input Text    ${FIRST_NAME_INPUT}    ${first_name}

Enter Last Name
    [Arguments]    ${last_name}
    Input Text    ${LAST_NAME_INPUT}    ${last_name}

Enter Postal Code
    [Arguments]    ${postal_code}
    Input Text    ${POSTAL_CODE_INPUT}    ${postal_code}

Click Continue Button
    Click Button    ${CONTINUE_BUTTON}

Verify Order Confirmation Page Is Displayed
    Wait Until Element Is Visible    ${CONFIRMATION_MESSAGE}    timeout=10s
    Element Should Be Visible    ${CONFIRMATION_MESSAGE}

Verify Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Be Visible    ${ERROR_MESSAGE}

Close Browser Session