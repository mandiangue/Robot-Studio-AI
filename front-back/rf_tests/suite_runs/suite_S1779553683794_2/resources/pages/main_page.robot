*** Settings ***
Suite Setup       Go To    ${LOGIN_BUTTON}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Page Object for SauceDemo Login and Products pages
Library          SeleniumLibrary
Resource         ../variables.robot

*** Keywords ***
Open Browser To Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Enter Username
    [Arguments]    ${username}
    Input Text    ${USERNAME_FIELD}    ${username}

Enter Password
    [Arguments]    ${password}
    Input Text    ${PASSWORD_FIELD}    ${password}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Products Page Is Displayed
    Wait Until Element Is Visible    ${PRODUCTS_TITLE}    timeout=10s
    Element Text Should Be           ${PRODUCTS_TITLE}    Products
    Page Should Contain Element      css=.inventory_list

Click Add To Cart For First Product
    Wait Until Element Is Visible    ${FIRST_ADD_BUTTON}    timeout=10s
    Click Button                     ${FIRST_ADD_BUTTON}

Cart Badge Shows
    [Arguments]    ${expected_count}
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Text Should Be           ${CART_BADGE}    ${expected_count}

First Product Button Shows Remove
    Element Text Should Be    ${FIRST_ADD_BUTTON}    Remove

Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Contain           ${ERROR_MESSAGE}    Username and password do not match

User Remains On Login Page
    Location Should Be    ${BASE_URL}/

Close Browser Session