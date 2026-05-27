*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for the-internet.herokuapp.com login tests

*** Variables ***
${BASE_URL}         https://the-internet.herokuapp.com/login
${BROWSER}          chrome
${VALID_USER}       tomsmith
${VALID_PASS}       SuperSecret!
${WRONG_PASS}       Superpassword!
${WRONG_USER}       wronguser
${LOGIN_TITLE}      Login Page
${SECURE_TITLE}     Secure Area
${USERNAME_FIELD}   id=username
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     xpath=//button[@class='radius']
${LOGOUT_BUTTON}    css=.button.secondary.radius
${FLASH_MESSAGE}    id=flash