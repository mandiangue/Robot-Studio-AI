*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Test suite for saucedemo.com covering login, sorting and cart management
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot

*** Test Cases ***
TC_001 — Connexion avec un utilisateur verrouillé
    [Documentation]    Attempt to log in with locked_out_user and verify the error message is shown
    [Tags]             login    negative

    When Login With Locked User
    Then Verify Locked User Error Message Is Shown
    And Verify Access To Catalogue Is Denied


TC_002 — Tri des produits par prix croissant
    [Documentation]    Log in with a valid user and sort products by price low to high
    [Tags]             sorting    products

    When Login With Valid User
    Then Verify User Is Successfully Logged In
    When Sort Products By Price Low To High
    Then Verify Products Are Sorted By Price Ascending


TC_003 — Suppression d'un article du panier
    [Documentation]    Log in, add a product to cart, then remove it and verify the cart is empty
    [Tags]             cart    remove

    When Login With Valid User
    Then Verify User Is Successfully Logged In
    When Add A Product To Cart
    Then Verify Cart Badge Shows One Item
    When Navigate To Cart
    And Remove The Product From Cart
    Then Verify Cart Is Now Empty
    And Verify Cart Badge Has Disappeared
