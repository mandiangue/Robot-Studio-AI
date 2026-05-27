*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords in BDD style for SauceDemo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533810736_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533810736_1/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Given User Navigates To SauceDemo Login Page
    Navigate To Login Page

When User Enters Valid Credentials And Submits Login Form
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

Then User Should Be Successfully Authenticated And See Products List
    Verify Products List Is Displayed

When User Adds Two Different Products To Cart
    Click Add To Cart For First Product
    Click Add To Cart For Second Product

Then Cart Should Display Two Items
    Verify Cart Badge Shows Count    2

When User Opens Cart And Proceeds To Checkout With Valid Shipping Information
    Click Cart Icon
    Click Checkout Button
    Enter First Name    ${FIRST_NAME}
    Enter Last Name    ${LAST_NAME}
    Enter Postal Code    ${POSTAL_CODE}
    Click Continue Button

Then User Should See Order Confirmation Page
    Verify Order Confirmation Page Is Displayed

When User Enters Invalid Credentials And Submits Login Form
    Enter Username    ${INVALID_USERNAME}
    Enter Password    ${INVALID_PASSWORD}
    Click Login Button

Then Error Message Should Be Displayed And User Should Remain On Login Page
    Verify Error Message Is Displayed

And User Closes Browser