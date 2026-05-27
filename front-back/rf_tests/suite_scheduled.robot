*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    chrome
Suite Teardown    Close Browser
Documentation    Test suite for login and logout scenarios on the-internet.herokuapp.com
Library          SeleniumLibrary
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/resources/keywords.robot



*** Test Cases ***
TC_001 — Login With Valid Credentials
    [Documentation]    Verify that a user can log in with valid credentials and sees a success message
    [Tags]             login    valid

    When Enter Valid Credentials
    And Submit The Login Form
    Then Verify Successful Login Message

TC_002 — Login With Incorrect Password
    [Documentation]    Verify that a user cannot log in with an incorrect password and sees an error message
    [Tags]             login    invalid    password

    When Enter Credentials With Wrong Password
    And Submit The Login Form
    Then Verify Invalid Password Message

TC_003 — Login With Incorrect Username
    [Documentation]    Verify that a user cannot log in with an incorrect username and sees an error message
    [Tags]             login    invalid    username

    When Enter Credentials With Wrong Username
    And Submit The Login Form
    Then Verify Invalid Username Message

TC_004 — Logout After Successful Login
    [Documentation]    Verify that a logged-in user can log out and is redirected with a confirmation message
    [Tags]             logout    valid

    And Enter Valid Credentials
    And Submit The Login Form
    And Verify Successful Login Message
    When Perform Logout
    Then Verify Successful Logout Message


*** Test Cases ***
TC_001 — Login With Locked Out User
    [Documentation]    Attempt to log in with locked_out_user and verify the error message is shown
    [Tags]             login    locked    TC_001

    When Enter Locked User Credentials
    And Click Login Button
    Then Locked Out Error Message Is Displayed


TC_002 — Sort Products By Price Low To High
    [Documentation]    Log in as standard_user, sort products by Price low to high and verify the order
    [Tags]             products    sort    TC_002

    When Enter Standard User Credentials
    And Click Login Button
    Then User Is Logged In And On Products Page
    When Sort Products By Price Low To High
    Then Products Are Displayed From Cheapest To Most Expensive


TC_003 — Remove A Product From The Cart
    [Documentation]    Log in as standard_user, add a product to cart, remove it and verify the cart is empty
    [Tags]             cart    remove    TC_003

    When Enter Standard User Credentials
    And Click Login Button
    Then User Is Logged In And On Products Page
    When Add A Product To The Cart
    And Go To The Cart Page
    And Remove The Product From The Cart
    Then The Cart Is Empty And Badge Is Gone
