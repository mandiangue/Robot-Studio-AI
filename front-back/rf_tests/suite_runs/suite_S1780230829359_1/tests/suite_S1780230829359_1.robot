*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Tests SauceDemo - BDD Style
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780230829359_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780230829359_1/resources/keywords.robot



*** Test Cases ***
TC_001 — Connexion avec un utilisateur verrouillé
    Given The User Is On The Login Page
    When The User Logs In With Locked Credentials
    Then An Error Message Should Indicate The Account Is Locked

TC_002 — Tri des produits par prix croissant
    Given The User Is Logged In As Standard User
    When The User Selects Sort By Price Low To High
    Then The Products Should Be Displayed From Lowest To Highest Price

TC_003 — Suppression d'un article du panier
    Given The User Is Logged In As Standard User
    When The User Adds The First Product To The Cart And Navigates To Cart
    And The User Removes The Item From The Cart
    Then The Cart Should Be Empty And Badge Should Disappear