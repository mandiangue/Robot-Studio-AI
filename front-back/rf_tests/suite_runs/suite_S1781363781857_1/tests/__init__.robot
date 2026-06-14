*** Settings ***
Resource    ../resources/variables.robot
Resource    ../resources/keywords.robot
Suite Setup     Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown  Close Browser
Test Setup      Go To    ${BASE_URL}