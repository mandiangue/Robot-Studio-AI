*** Settings ***


Documentation     SauceDemo end-to-end test suite covering login, sorting, cart, checkout, logout and product detail
Library           Browser
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/main_page.robot

*** Test Cases ***
TC_001 — Connexion avec un utilisateur bloqué
    Given User Is On Login Page
    When User Logs In With Credentials    ${LOCKED_USER}    ${PASSWORD}
    Then Login Error Message Is Visible
    And Login Error Contains Locked Message

TC_002 — Tri des produits par prix croissant
    Given User Is On Login Page
    When User Logs In With Credentials    ${VALID_USER}    ${PASSWORD}
    And User Sorts Products By Price Low To High
    Then Products Are Displayed By Price Ascending

TC_003 — Suppression d'un article du panier
    Given User Is On Login Page
    When User Logs In With Credentials    ${VALID_USER}    ${PASSWORD}
    And User Adds First Product To Cart
    And User Navigates To Cart
    When User Removes Product From Cart
    Then Cart Is Empty
    And Cart Badge Is Not Visible

TC_004 — Finalisation d'une commande complète
    Given User Is On Login Page
    When User Logs In With Credentials    ${VALID_USER}    ${PASSWORD}
    And User Adds First Product To Cart
    And User Navigates To Cart
    And User Proceeds To Checkout
    When User Fills Checkout Information    ${FIRST_NAME}    ${LAST_NAME}    ${ZIP_CODE}
    And User Continues Checkout
    And User Finishes Order
    Then Order Confirmation Is Displayed

TC_005 — Déconnexion depuis le menu latéral
    Given User Is On Login Page
    When User Logs In With Credentials    ${VALID_USER}    ${PASSWORD}
    And User Opens Hamburger Menu
    When User Clicks Logout
    Then User Is Redirected To Login Page

TC_006 — Vérification des détails d'un produit
    Given User Is On Login Page
    When User Logs In With Credentials    ${VALID_USER}    ${PASSWORD}
    And User Clicks On First Product Name
    Then Product Detail Page Is Displayed
    And Product Detail Has Add To Cart Button