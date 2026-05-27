*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for Sauce Demo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779538282768_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779538282768_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Given Open Sauce Demo Application
    Open Sauce Demo Website

When User Enters Valid Username
    Enter Username    ${VALID_USERNAME}

And User Enters Valid Password
    Enter Password    ${VALID_PASSWORD}

And User Clicks Login Button
    Click Login Button

Then User Should Be Successfully Logged In
    Wait For Inventory Page

When User Adds First Product To Cart
    Click Add To Cart For First Product
    Sleep    1s

Then Product Should Be Added To Cart
    Verify Product Added To Cart

When User Selects Sort Option Price Ascending
    Select Sort Option By Price Ascending

Then Products List Should Be Sorted By Price Ascending
    Wait For Products Sorted

When User Navigates To Cart Page
    Click Cart Icon

And User Proceeds To Checkout
    Click Checkout Button

And User Enters Shipping Information
    Enter First Name    John
    Enter Last Name    Doe
    Enter Postal Code    12345
    Click Continue Button

And User Completes The Order
    Click Finish Button

Then Order Should Be Successfully Completed
    Verify Order Confirmation

And Close Application