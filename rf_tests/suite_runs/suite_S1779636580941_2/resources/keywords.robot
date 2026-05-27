*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--headless=new");add_argument("--no-sandbox");add_argument("--disable-dev-shm-usage");add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic");
Suite Teardown    Close Browser
Documentation    Business Keywords for Sauce Demo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779636580941_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779636580941_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given User Opens The Sauce Demo Application
    Open Sauce Demo Application

When User Enters Valid Credentials
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}

When User Clicks The Login Button
    Click Login Button

Then User Should See The Product List
    Verify Product List Is Displayed

When User Selects A Product And Adds It To Cart
    Click Add To Cart Button

Then The Product Should Appear In Cart With Correct Count
    Verify Item Count In Cart Badge    1

Then The Product Price Should Be Visible
    ${price}=    Get First Product Price
    Should Not Be Empty    ${price}

When User Navigates To Cart
    Click Cart Link

When User Proceeds To Checkout
    Click Checkout Button

When User Fills Delivery Information With Personal Data
    Enter First Name    John
    Enter Last Name    Doe
    Enter Postal Code    75001

When User Clicks Continue Button
    Click Continue Button

When User Completes Payment Process
    Click Finish Button

Then Confirmation Message Should Be Displayed
    Verify Order Confirmation Is Displayed

And User Closes Browser Session