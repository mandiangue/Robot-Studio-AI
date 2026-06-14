*** Settings ***


Documentation     SauceDemo end-to-end tests
Library           Browser
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/main_page.robot

*** Test Cases ***
TC_001 Connexion Avec Utilisateur Verrouille
    [Documentation]    Tenter de se connecter avec locked_out_user
    Login With User    ${LOCKED_USER}    ${PASSWORD}
    Verify Login Error Message    ${LOCKED_ERROR_MSG}

TC_002 Tri Des Produits Par Prix Decroissant
    [Documentation]    Tri Price (high to low)
    Login With User    ${STANDARD_USER}    ${PASSWORD}
    Sort Products By    hilo
    Verify Products Sorted By Price Descending

TC_003 Ajout De Plusieurs Produits Au Panier
    [Documentation]    Ajouter 3 produits au panier
    Login With User    ${STANDARD_USER}    ${PASSWORD}
    Add Three Products To Cart
    Verify Cart Badge Count    3
    Open Cart Page
    Verify Cart Contains Items    3

TC_004 Suppression D Un Produit Depuis Le Panier
    [Documentation]    Retirer un produit du panier
    Login With User    ${STANDARD_USER}    ${PASSWORD}
    Add Single Product To Cart    sauce-labs-backpack
    Verify Cart Badge Count    1
    Open Cart Page
    Remove Product From Cart Page    sauce-labs-backpack
    Verify Cart Is Empty

TC_005 Validation Des Champs Obligatoires Checkout
    [Documentation]    Continue sans remplir les champs
    Login With User    ${STANDARD_USER}    ${PASSWORD}
    Add Single Product To Cart    sauce-labs-backpack
    Open Cart Page
    Start Checkout Process
    Continue Checkout
    Verify Checkout Error Message    ${FIRSTNAME_ERROR_MSG}

TC_006 Finalisation Complete D Une Commande
    [Documentation]    Commande complète avec succès
    Login With User    ${STANDARD_USER}    ${PASSWORD}
    Add Single Product To Cart    sauce-labs-backpack
    Open Cart Page
    Start Checkout Process
    Fill Checkout Information    ${CHECKOUT_FIRSTNAME}    ${CHECKOUT_LASTNAME}    ${CHECKOUT_POSTAL}
    Continue Checkout
    Finish Checkout
    Verify Order Confirmation    ${ORDER_SUCCESS_MSG}