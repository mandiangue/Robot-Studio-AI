*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests Saucedemo
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780150537063_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1780150537063_2/resources/keywords.robot



*** Test Cases ***
TC_101 — Connexion avec un utilisateur verrouillé
    Login As Locked User
    Verify Locked User Cannot Login

TC_102 — Tri des produits par prix croissant
    Login As Standard User
    Sort Products By Price Low To High
    Verify Products Sorted By Price Ascending

TC_103 — Ajout d'un produit au panier et vérification
    Login As Standard User
    Add Backpack To Cart
    Verify Cart Badge Count    1
    Go To Cart
    Verify Cart Has One Backpack