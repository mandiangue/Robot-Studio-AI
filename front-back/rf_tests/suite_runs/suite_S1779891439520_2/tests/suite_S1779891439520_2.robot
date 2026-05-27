*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests SauceDemo — Connexion verrouillée, Tri produits, Suppression panier
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779891439520_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779891439520_2/resources/keywords.robot



*** Test Cases ***
TC_001 — Connexion avec un utilisateur verrouillé
    [Documentation]    Tenter de se connecter avec locked_out_user et vérifier le message d'erreur
    Given Login With Locked User
    Then Verify Locked User Error Message

TC_002 — Tri des produits par prix croissant
    [Documentation]    Connexion standard_user, trier par prix croissant et vérifier l'ordre
    Given Login With Standard User
    When Sort Products By Price Low To High
    Then Verify Products Sorted By Price Ascending

TC_003 — Suppression d'un article du panier
    [Documentation]    Connexion standard_user, ajouter un produit, aller au panier, supprimer et vérifier
    Given Login With Standard User
    When Add Product To Cart And Go To Cart
    And Remove Product From Cart
    Then Verify Cart Is Empty