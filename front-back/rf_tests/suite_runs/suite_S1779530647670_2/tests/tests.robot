*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Go To    ${BASE_URL}    options=add_argument("--disable-notifications");add_argument("--disable-popup-blocking");add_argument("--disable-infobars");add_argument("--disable-save-password-bubble");add_argument("--disable-features=PasswordManagerEnabled,PasswordLeakDetection");add_argument("--disable-features=TranslateUI");add_argument("--no-first-run");add_argument("--password-store=basic")
Suite Teardown    Close Browser
Documentation    Test Cases for SauceDemo application
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
Login With Valid Credentials Should Display Inventory Page
    [Documentation]    TC_001 — Connexion avec identifiants valides
    Login With Valid Credentials
    Cleanup Browser

Add Product To Cart Should Update Cart Badge
    [Documentation]    TC_002 — Ajout d'un produit au panier
    Login With Valid Credentials
    Add First Product To Cart
    Cleanup Browser

Complete Checkout Process Should Show Confirmation
    [Documentation]    TC_003 — Processus de paiement complet
    Login With Valid Credentials
    Add First Product To Cart
    Perform Complete Checkout
    Return To Home Page
    Cleanup Browser

Login With Invalid Credentials Should Display Error Message
    [Documentation]    TC_004 — Tentative de connexion avec identifiants invalides
    Login With Invalid Credentials
    Get Error Message Text
    Cleanup Browser