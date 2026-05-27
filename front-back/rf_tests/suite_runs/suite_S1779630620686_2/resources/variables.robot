*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for the login test suite

*** Variables ***
${BASE_URL}           https://the-internet.herokuapp.com/login
${BROWSER}            chrome
${USERNAME_FIELD}     id=username
${PASSWORD_FIELD}     id=password
${LOGIN_BUTTON}       xpath=//button[@class='radius']
${FLASH_MESSAGE}      id=flash
${LOGOUT_BUTTON}      css=.button.secondary.radius
${VALID_USERNAME}     tomsmith
${VALID_PASSWORD}     SuperSecretPassword!
${WRONG_PASSWORD}     Superpassword!
${WRONG_USERNAME}     wronguser