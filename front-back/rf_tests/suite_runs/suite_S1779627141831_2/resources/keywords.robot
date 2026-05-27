*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business-level BDD keywords for SauceDemo test suite
Library          SeleniumLibrary
Library          Collections
Library          String
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627141831_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779627141831_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

Open Login Page


Enter Valid Credentials
    Fill Username Field    ${VALID_USERNAME}
    Fill Password Field    ${VALID_PASSWORD}

Submit Login Form
    Click Login Button

Verify User Is On Inventory Page
    Verify Inventory Page Is Displayed

Select Price Low To High Sort Option
    Select Sort Option Low To High

Verify Products Are Sorted By Price Low To High
    Verify Prices Are Sorted Low To High

Add A Product To The Cart
    Add First Product To Cart

Verify Cart Badge Displays One Item
    Verify Cart Badge Shows One

Navigate To Cart Page
    Click Cart Icon
    Verify Cart Page Is Displayed

Remove The Item From The Cart
    Click Remove Button In Cart

Verify Cart Is Now Empty
    Verify Cart Is Empty
    Verify Cart Badge Is Gone

Open Burger Menu
    Click Burger Menu

Click On Logout
    Click Logout Link

Verify User Is Redirected To Login Page
    Verify Login Page Is Displayed After Logout

Close Browser Session
    Close Test Browser