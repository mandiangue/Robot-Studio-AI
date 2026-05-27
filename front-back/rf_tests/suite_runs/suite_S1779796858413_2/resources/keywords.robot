*** Settings ***
Suite Setup       Go To    ${url}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Keywords métier - SauceDemo
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779796858413_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779796858413_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()


Login With Locked User
    Open Login Page
    Fill Username    ${LOCKED_USER}
    Fill Password    ${PASSWORD}
    Click Login Button

Verify Locked User Error Message
    ${message}=    Get Error Message Text
    Should Contain    ${message}    Sorry, this user has been locked out

Login With Standard User
    Open Login Page
    Fill Username    ${STANDARD_USER}
    Fill Password    ${PASSWORD}
    Click Login Button
    Wait Until Element Is Visible    css=.inventory_container    timeout=10s

Sort Products By Price Low To High
    Select Sort Option    lohi

Verify Products Sorted By Price Ascending
    ${price_elements}=    Get All Product Prices
    ${previous}=    Set Variable    ${0}
    FOR    ${element}    IN    @{price_elements}
        ${raw}=    Get Text    ${element}
        ${clean}=    Remove String    ${raw}    $
        ${value}=    Convert To Number    ${clean}
        Should Be True    ${value} >= ${previous}
        ${previous}=    Set Variable    ${value}
    END

Add Product To Cart And Navigate To Cart
    Add First Product To Cart
    Go To Cart

Remove Product And Verify Cart Is Empty
    Remove Product From Cart
    Cart Badge Should Not Be Visible
    Cart Should Be Empty

Navigate Back To Products Page
    Go To    ${BASE_URL}/inventory.html
    Wait Until Element Is Visible    css=.inventory_container    timeout=10s