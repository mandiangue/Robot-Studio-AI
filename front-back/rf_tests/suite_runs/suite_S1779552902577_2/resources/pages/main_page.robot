*** Settings ***
Suite Setup       Open Browser No Popup    ${LOGIN_BUTTON}    chrome
Suite Teardown    Close Browser
Documentation    Page Object Main - Login and Inventory interactions
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

Verify Inventory Page Is Displayed
    Wait Until Element Is Visible    ${INVENTORY_TITLE}    timeout=10s
    Element Text Should Be           ${INVENTORY_TITLE}    Products

Verify Error Message Is Displayed
    Wait Until Element Is Visible    ${ERROR_MESSAGE}    timeout=10s
    Element Should Contain           ${ERROR_MESSAGE}     Username and password do not match

Verify User Stays On Login Page
    Location Should Be    ${BASE_URL}/

Click Add To Cart For First Product
    Wait Until Element Is Visible    ${ADD_TO_CART_BTN}    timeout=10s
    Click Button                     ${ADD_TO_CART_BTN}

Verify Cart Badge Shows One
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=10s
    Element Text Should Be           ${CART_BADGE}    1

Verify Remove Button Is Displayed
    Element Text Should Be    ${REMOVE_BTN}    Remove

Close Browser Session