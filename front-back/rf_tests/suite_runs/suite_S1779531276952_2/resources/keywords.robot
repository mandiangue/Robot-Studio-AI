*** Settings ***
Suite Setup       Go To    ${LOGIN_INPUT_USERNAME}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business Keywords
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Open Application
    [Documentation]    Open the Saucedemo application

    Maximize Browser Window

Close Application
    [Documentation]    Close the application


Login With Valid Credentials
    [Documentation]    Login with standard_user and secret_sauce
    Input Text    ${LOGIN_INPUT_USERNAME}    ${USERNAME}
    Input Text    ${LOGIN_INPUT_PASSWORD}    ${PASSWORD}
    Click Element    ${LOGIN_BUTTON}
    Wait Until Element Is Visible    ${PRODUCTS_CONTAINER}    timeout=5s

Verify Login Success And Products Displayed
    [Documentation]    Verify successful login with welcome message and products visible
    Verify Welcome Message Visible
    Verify Products Container Visible

Add Product To Cart By Index
    [Arguments]    ${index}
    [Documentation]    Add a single product to cart by its index position
    ${button}=    Get Product Add To Cart Button By Index    ${index}
    Click Element    ${button}

Add Multiple Products To Cart
    [Arguments]    ${count}
    [Documentation]    Add multiple products to cart sequentially
    :FOR    ${i}    IN RANGE    1    ${count}+1
    \    Add Product To Cart By Index    ${i}
    \    Sleep    0.5s

Verify Cart Badge Count
    [Arguments]    ${expected_count}
    [Documentation]    Verify cart badge displays the expected count
    Wait Until Element Is Visible    ${CART_BADGE}    timeout=5s
    ${badge_text}=    Get Cart Badge Text
    Should Be Equal    ${badge_text}    ${expected_count}

Verify Products Added To Cart
    [Arguments]    ${count}
    [Documentation]    Navigate to cart and verify products are present
    Click Cart Link
    Wait Until Element Is Visible    class=cart_list    timeout=5s
    ${cart_items}=    Get WebElements    class=cart_item
    Length Should Be    ${cart_items}    ${count}

Sort Products By Price Low To High
    [Documentation]    Sort products by price in ascending order
    Select Sort Option    lohi
    Sleep    1s

Verify Products Sorted By Price Ascending
    [Documentation]    Verify products are displayed in ascending price order
    ${prices}=    Get All Product Prices
    ${price_values}=    Create List
    :FOR    ${price}    IN    @{prices}
    \    ${text}=    Get Text    ${price}
    \    ${value}=    Evaluate    float("${text}".replace('$', ''))
    \    Append To List    ${price_values}    ${value}
    ${sorted_prices}=    Evaluate    sorted(${price_values})
    Should Be Equal    ${price_values}    ${sorted_prices}