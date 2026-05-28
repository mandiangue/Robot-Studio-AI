*** Settings ***
Test Setup        Go To    ${BASE_URL}
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation      Tests SauceDemo - Connexion, Panier, Tri
Library            SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779977415724_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1779977415724_1/resources/keywords.robot



*** Test Cases ***
TC_001 - Login With Locked Out User
    [Documentation]    Saisir les identifiants d'un utilisateur bloqué et vérifier le message d'erreur
    Given Login With Locked User
    Then Verify Locked User Cannot Access Catalog

TC_002 - Add Product To Cart From Catalog Page
    [Documentation]    Se connecter avec standard_user, ajouter un produit au panier et vérifier le compteur
    Given Login With Standard User
    When Add Product To Cart And Verify

TC_003 - Sort Products By Price Low To High
    [Documentation]    Se connecter avec standard_user et trier les produits par prix croissant
    Given Login With Standard User
    When Sort Products By Price Low To High And Verify