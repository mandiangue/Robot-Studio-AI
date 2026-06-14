*** Settings ***
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Documentation    Tests Main - SauceDemo
Library    SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1781267842358_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1781267842358_2/resources/keywords.robot



*** Test Cases ***
TC_001 Connexion Avec Utilisateur Problematique
    Given User Is On Login Page
    When User Logs In With    ${PROBLEM_USER}    ${PASSWORD}
    Then User Should Be On Inventory Page

TC_002 Tri Des Produits Par Prix Decroissant
    Given User Is On Login Page
    When User Logs In With    ${STANDARD_USER}    ${PASSWORD}
    Then User Should Be On Inventory Page
    When User Selects Sort Option    hilo
    Then Products Should Be Sorted By Price Descending

TC_003 Ajout De Plusieurs Produits Au Panier
    Given User Is On Login Page
    When User Logs In With    ${STANDARD_USER}    ${PASSWORD}
    Then User Should Be On Inventory Page
    When User Adds Product To Cart    ${ADD_BACKPACK}
    And User Adds Product To Cart    ${ADD_BIKE_LIGHT}
    And User Adds Product To Cart    ${ADD_BOLT_TSHIRT}
    Then Cart Badge Should Show    3
    When User Opens Cart
    Then Cart Should Contain Items    3

TC_004 Suppression D Un Produit Depuis Le Panier
    Given User Is On Login Page
    When User Logs In With    ${STANDARD_USER}    ${PASSWORD}
    Then User Should Be On Inventory Page
    When User Adds Product To Cart    ${ADD_BACKPACK}
    And User Opens Cart
    Then Cart Should Contain Items    1
    When User Removes Product From Cart    ${REMOVE_BACKPACK_CART}
    Then Cart Should Be Empty

TC_005 Validation Du Formulaire De Checkout Avec Champs Vides
    Given User Is On Login Page
    When User Logs In With    ${STANDARD_USER}    ${PASSWORD}
    Then User Should Be On Inventory Page
    When User Adds Product To Cart    ${ADD_BACKPACK}
    And User Opens Cart
    And User Starts Checkout
    And User Clicks Continue
    Then Error Message Should Contain    First Name is required

TC_006 Finalisation Complete D Une Commande
    Given User Is On Login Page
    When User Logs In With    ${STANDARD_USER}    ${PASSWORD}
    Then User Should Be On Inventory Page
    When User Adds