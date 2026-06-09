*** Settings ***
Documentation    Page Object for Checkout Page
Library          Browser
Resource         ../variables.robot

*** Keywords ***
Fill First Name
    [Arguments]    ${first_name}
    Fill Text    css=[data-test="firstName"]    ${first_name}

Fill Last Name
    [Arguments]    ${last_name}
    Fill Text    css=[data-test="lastName"]    ${last_name}

Fill Postal Code
    [Arguments]    ${postal_code}
    Fill Text    css=[data-test="postalCode"]    ${postal_code}

Click Continue Button
    Click    css=[data-test="continue"]

Click Finish Button
    Click    css=[data-test="finish"]

Order Confirmation Should Be Visible
    Wait For Elements State    css=[data-test="complete-header"]    visible    timeout=10s

Order Confirmation Text Should Match
    Get Text    css=[data-test="complete-header"]
