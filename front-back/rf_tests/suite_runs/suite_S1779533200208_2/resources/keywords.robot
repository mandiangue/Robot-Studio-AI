*** Settings ***
Suite Setup       Go To    ${LOGIN_USERNAME_FIELD}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Business keywords for SauceDemo tests
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533200208_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779533200208_2/resources/pages/main_page.robot

*** Keywords ***
Open Browser No Popup
    [Arguments]    ${url}    ${browser}=chrome
    ${opts}=    Evaluate    __import__('no_popup').create_chrome_options()
    Open Browser No Popup    ${url}    ${browser}

Open Application

    Maximize Browser Window

Close Application


Perform Login With Valid Credentials
    Wait Until Element Is Visible    ${LOGIN_USERNAME_FIELD}    timeout=10s
    Input Text    ${LOGIN_USERNAME_FIELD}    ${USERNAME_VALID}
    Input Text    ${LOGIN_PASSWORD_FIELD}    ${PASSWORD_VALID}
    Click Button    ${LOGIN_BUTTON}

Add First Product To Cart
    Click Add To Cart Button For First Product
    Sleep    1s

Verify Product Is Added To Cart
    ${cart_count}=    Get Cart Badge Count
    Should Be Equal    ${cart_count}    1

Sort Products By Price Low To High
    Select Sort Option By Price Low To High
    Sleep    2s

Verify Products Are Correctly Sorted By Price
    Verify Products Are Sorted By Price Low To High