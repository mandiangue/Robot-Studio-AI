*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords for SauceDemo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Login With Valid Credentials
    Open Login Page
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button
    Verify Inventory Page Displayed

Login With Invalid Credentials
    Open Login Page
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}
    Click Login Button
    Verify Error Message Displayed

Add First Product To Cart
    Click Add To Cart Button    1
    Verify Cart Badge Shows Count    1

Perform Complete Checkout
    Click Cart Icon
    Click Checkout Button
    Enter Checkout Information    John    Doe    12345
    Click Continue Button
    Click Finish Button
    Verify Order Confirmation Displayed

Return To Home Page
    Click Back Home Button

Cleanup Browser