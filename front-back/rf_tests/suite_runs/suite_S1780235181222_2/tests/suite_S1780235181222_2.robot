*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780235181222_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780235181222_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Connexion avec un utilisateur verrouillé

    When User Attempts Login With Locked Account
    Then Locked Error Message Should Be Displayed

TC_002 — Tri des produits par prix croissant
    Given User Is Logged In As Standard User
    When User Sorts Products By Price Ascending
    Then Products Should Be Sorted By Price Ascending

TC_003 — Suppression d'un article du panier
    Given User Is Logged In As Standard User
    When User Adds First Product To Cart And Opens Cart
    And User Removes The Item From Cart
    Then Cart Should Be Empty