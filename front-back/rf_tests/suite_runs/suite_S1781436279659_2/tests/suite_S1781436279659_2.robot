*** Settings ***


Documentation     Saucedemo end-to-end tests
Library           Browser
Library           String
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/main_page.robot

*** Test Cases ***
TC_001 Connexion Avec Utilisateur Performance Glitch
    [Documentation]    Connexion avec performance_glitch_user
    Given Login With User    ${PERFORMANCE_USER}    ${PASSWORD}
    Then Verify Inventory Page Loaded

TC_002 Tri Des Produits Par Prix Decroissant
    [Documentation]    Tri Price (high to low)
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Inventory Page Loaded
    When Sort Products By    hilo
    Then Verify Products Sorted Descending By Price

TC_003 Suppression D'Un Produit Depuis Le Panier
    [Documentation]    Retirer un produit du panier
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Inventory Page Loaded
    And Add First Product To Cart
    When Open Cart
    And Remove Product From Cart
    Then Verify Cart Badge Empty

TC_004 Finalisation Complete D'Une Commande
    [Documentation]    Process complet de commande
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Inventory Page Loaded
    And Add First Product To Cart
    And Open Cart
    When Proceed To Checkout
    And Fill Checkout Information    ${FIRST_NAME}    ${LAST_NAME}    ${POSTAL_CODE}
    And Continue Checkout
    And Finish Checkout
    Then Verify Order Confirmation

TC_005 Validation Des Champs Obligatoires Lors Du Checkout
    [Documentation]    Champs obligatoires checkout
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Inventory Page Loaded
    And Add First Product To Cart
    And Open Cart
    And Proceed To Checkout
    When Continue Checkout
    Then Verify Error Message Contains    First Name is required

TC_006 Deconnexion Via Le Menu Lateral
    [Documentation]    Logout via menu hamburger
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Inventory Page Loaded
    When Open Side Menu
    And Click Logout Link
    Then Verify Login Page Displayed
