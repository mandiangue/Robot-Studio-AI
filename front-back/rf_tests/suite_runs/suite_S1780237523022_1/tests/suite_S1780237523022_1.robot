*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests SauceDemo - Connexion verrouillée, tri par prix, suppression panier
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780237523022_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780237523022_1/resources/keywords.robot



*** Test Cases ***
TC_001 - Login With Locked User Should Display Error Message

    When User Logs In With Locked Account
    Then Error Message Should Indicate Account Is Locked

TC_002 - Sort Products By Price Low To High Should Reorder Products

    When User Logs In With Standard Account
    When User Selects Sort By Price Low To High
    Then Products Should Be Sorted By Price Ascending

TC_003 - Remove Item From Cart Should Empty The Cart

    When User Logs In With Standard Account
    When User Adds First Product To Cart
    And User Navigates To Cart Page
    When User Removes The Item From Cart
    Then Cart Should Be Empty And Badge Should Disappear