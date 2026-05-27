*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords for Saucedemo Tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540564412_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779540564412_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Given User Opens The Login Page
    Open Login Page

When User Enters Valid Username And Password
    Enter Username    ${STANDARD_USER}
    Enter Password    ${VALID_PASSWORD}

When User Enters Invalid Username And Password
    Enter Username    ${INVALID_USER}
    Enter Password    ${INVALID_PASSWORD}

When User Clicks The Login Button
    Click Login Button

Then User Is Redirected To Inventory Page
    Verify Inventory Page Is Displayed

Then User Sees The Products List
    Page Should Contain Element    ${PRODUCTS_CONTAINER}

Then Error Message Is Displayed With Text
    [Arguments]    ${error_text}
    Verify Error Message Is Displayed    ${error_text}

When User Clicks Add To Cart For First Product
    Click Add To Cart First Product

Then Product Is Added To Cart And Badge Shows
    Verify Cart Badge Shows Count    1

Then Add To Cart Button Is Changed To Remove
    Verify Add To Cart Button Changed To Remove

When User Selects Sort Option Price Low To High
    Select Sort Option Low To High

Then Products Are Displayed Sorted By Price From Low To High
    Verify Products Are Sorted By Price Low To High

And User Waits For Page Load
    Sleep    1s