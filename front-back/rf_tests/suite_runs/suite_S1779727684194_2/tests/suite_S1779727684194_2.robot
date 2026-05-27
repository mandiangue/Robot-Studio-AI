*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests SauceDemo - Connexion, Tri et Panier
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779727684194_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779727684194_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Connexion avec un utilisateur verrouillé
    Given The Login Page Is Open
    When User Logs In With Locked Account
    Then An Error Message Should Be Displayed For Locked User

TC_002 — Tri des produits par prix croissant
    Given The User Is Logged In With Valid Account
    When User Sorts Products By Price Low To High
    Then Products Should Be Displayed In Ascending Price Order

TC_003 — Suppression d'un article du panier
    Given The User Is Logged In With Valid Account
    When User Adds First Product To Cart And Navigates To Cart
    When User Removes The Item From Cart
    Then The Cart Should Be Empty
    And The Cart Badge Should Not Be Visible