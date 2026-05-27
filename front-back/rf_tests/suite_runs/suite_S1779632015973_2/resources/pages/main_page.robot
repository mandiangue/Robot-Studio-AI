*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object for SauceDemo — Login, Inventory and Navigation
Library           SeleniumLibrary
Resource          ../variables.robot

*** Keywords ***
Open Browser To Login Page

    Maximize Browser Window
    Wait Until Element Is Visible    ${USERNAME_FIELD}    timeout=10s

Fill Username Field
    Input Text    ${USERNAME_FIELD}    ${USERNAME}

Fill Password Field
    Input Text    ${PASSWORD_FIELD}    ${PASSWORD}

Click Login Button
    Click Button    ${LOGIN_BUTTON}

Verify Products Page Is Displayed
    Wait Until Element Is Visible    ${PRODUCTS_TITLE}    timeout=10s
    Element Text Should Be           ${PRODUCTS_TITLE}    Products

Click Add To Cart For First Product
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button                     ${ADD_TO_CART_BTN}

Verify Cart Badge Shows One
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Text Should Be           ${CART_BADGE}    1

Verify First Product Button Is Remove
    Wait Until Element Is Visible    ${REMOVE_BTN}    timeout=10s
    ${btn_text}=    Get Text         ${REMOVE_BTN}
    Should Be Equal As Strings       ${btn_text}    Remove

Open Burger Menu
    Wait Until Element Is Visible    ${BURGER_MENU}    timeout=10s
    Click Element                    ${BURGER_MENU}

Click Logout Option
    Wait Until Element Is Visible    ${LOGOUT_LINK}    timeout=10s
    Click Element                    ${LOGOUT_LINK}

Verify Login Page Is Displayed
    Wait Until Element Is Visible    ${LOGIN_CONTAINER}    timeout=10s
    Page Should Contain Element      ${LOGIN_BUTTON}

Verify Protected Page Is Not Accessible
    Go To                            ${BASE_URL}/inventory.html
    Wait Until Element Is Visible    ${LOGIN_CONTAINER}    timeout=10s
    Page Should Contain Element      ${LOGIN_BUTTON}

Close Test Browser