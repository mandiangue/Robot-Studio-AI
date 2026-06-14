*** Settings ***


Documentation     SauceDemo end-to-end tests
Library           Browser
Resource          ../resources/variables.robot
Resource          ../resources/keywords.robot
Resource          ../resources/pages/main_page.robot

*** Test Cases ***
TC_001 Connexion avec utilisateur problematique
    [Documentation]    Login with problem_user
    Given Login With User    ${PROBLEM_USER}    ${PASSWORD}
    When Verify Products Page Displayed
    Then Verify Product Images Loaded

TC_002 Tri des produits par prix croissant
    [Documentation]    Sort products price low to high
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Products Page Displayed
    When Sort Products By    lohi
    Then Verify Prices Sorted Ascending

TC_003 Ajout de plusieurs produits au panier
    [Documentation]    Add 3 products to cart
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Products Page Displayed
    When Add Three Products To Cart
    Then Verify Cart Badge Count    3
    And Verify Cart Items Count    3

TC_004 Suppression d un produit depuis le panier
    [Documentation]    Remove product from cart
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Products Page Displayed
    And Add One Product To Cart
    When Remove Product From Cart Page
    Then Verify Cart Badge Not Visible

TC_005 Finalisation d une commande complete
    [Documentation]    Complete checkout flow
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Products Page Displayed
    And Add One Product To Cart
    When Complete Checkout Process    ${FIRST_NAME}    ${LAST_NAME}    ${POSTAL_CODE}
    Then Verify Order Confirmation

TC_006 Deconnexion depuis le menu lateral
    [Documentation]    Logout from side menu
    Given Login With User    ${STANDARD_USER}    ${PASSWORD}
    And Verify Products Page Displayed
    When Open Menu And Logout
    Then Verify Login Page Displayed



