*** Settings ***
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for Sauce Demo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779640087709_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('sys').path.insert(0, 'C:/Users/Landing/Desktop/docDev/robotClaude/front-back') or __import__('no_popup').create_chrome_options()
    Open Browser    ${url}    ${browser}    options=${opts}

User Logs In With Valid Credentials
    [Documentation]    User logs in with valid username and password
    Enter Username    ${VALID_USERNAME}
    Enter Password    ${VALID_PASSWORD}
    Click Login Button

User Is Successfully Authenticated
    [Documentation]    Verifies user is authenticated and on products page
    Verify Products Page Displayed

User Adds Product To Cart By Name
    [Arguments]    ${product_name}
    [Documentation]    User adds a specific product to cart
    Add Product To Cart    ${product_name}

Product Is Added To Cart Successfully
    [Arguments]    ${quantity}
    [Documentation]    Verifies product was added successfully with correct quantity
    Verify Product Added To Cart    ${quantity}
    Open Cart Page
    Verify Product In Cart    ${PRODUCT_NAME}

User Sorts Products By Price Ascending
    [Documentation]    User selects price ascending sort option
    Select Sort Option    ${SORT_PRICE_ASC}

Products Are Displayed In Ascending Price Order
    [Documentation]    Verifies products are sorted from lowest to highest price
    Verify Products Sorted By Price Ascending