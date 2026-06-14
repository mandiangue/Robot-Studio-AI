*** Settings ***
Resource    ../resources/variables.robot
Resource    ../resources/keywords.robot
Suite Setup     Open Browser Session    ${BASE_URL}
Suite Teardown  Close Browser
Test Setup      Go To    ${BASE_URL}


