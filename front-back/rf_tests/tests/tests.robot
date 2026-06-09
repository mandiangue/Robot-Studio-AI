*** Settings ***
Suite Setup       Open Browser Session    ${BASE_URL}
Suite Teardown    Close Browser


Test Setup        Go To    ${BASE_URL}
Test Teardown     Take Screenshot
Documentation     Saucedemo test suite covering login, cart, checkout, sorting, logout and product detail
Library           Browser
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/login_page.robot
Resource          ../resources/pages/inventory_page.robot
Resource          ../resources/pages/cart_page.robot
Resource          ../resources/pages/checkout_page.robot
Resource          ../resources/pages/product_detail_page.robot

*** Test Cases ***
TC_001 — Connexion avec un utilisateur verrouillé
    Given Go To    ${BASE_URL}
    When Login As User    ${LOCKED_USER}    ${PASSWORD}
    Then Login Should Fail With Locked Error

TC_002 — Tri des produits par prix croissant
    Given Login As User    ${STANDARD_USER}    ${PASSWORD}
    And Inventory Page Should Be Loaded
    When Select Sort Option    lohi
    Then Products Are Sorted By Price Low To High

TC_003 — Suppression d'un article du panier
    Given Login As User    ${STANDARD_USER}    ${PASSWORD}
    And Inventory Page Should Be Loaded
    And Product Is Added To Cart
    When Navigate To Cart
    And Cart Page Should Be Loaded
    Then Product Is Removed From Cart

TC_004 — Finalisation d'une commande complète
    Given Login As User    ${STANDARD_USER}    ${PASSWORD}
    And Inventory Page Should Be Loaded
    And Product Is Added To Cart
    And Navigate To Cart
    And Cart Page Should Be Loaded
    When Click Checkout Button
    And Checkout Info Is Filled    ${FIRST_NAME}    ${LAST_NAME}    ${POSTAL_CODE}
    And Click Finish Button
    Then Order Is Confirmed

TC_005 — Déconnexion depuis le menu burger
    Given Login As User    ${STANDARD_USER}    ${PASSWORD}
    And Inventory Page Should Be Loaded
    When Open Burger Menu
    And Click Logout Link
    Then User Is On Login Page

TC_006 — Accès à la page de détail d'un produit
    Given Login As User    ${STANDARD_USER}    ${PASSWORD}
    And Inventory Page Should Be Loaded
    When Click First Product Name
    Then Product Detail Is Fully Displayed