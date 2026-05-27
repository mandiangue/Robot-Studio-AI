*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for the login test suite

*** Variables ***
${BASE_URL}           https://the-internet.herokuapp.com/login
${BROWSER}            chrome
${VALID_USERNAME}     tomsmith
${VALID_PASSWORD}     SuperSecretPassword!
${WRONG_PASSWORD}     SuperSecretPassword
${WRONG_USERNAME}     avec
${SUCCESS_MESSAGE}    You logged into a secure area!
${ERROR_PASSWORD}     Your password is invalid!
${ERROR_USERNAME}     Your username is invalid!
${USERNAME_FIELD}     id=username
${PASSWORD_FIELD}     id=password
${LOGIN_BUTTON}       css=button[type='submit']
${FLASH_MESSAGE}      id=flash
${FLASH_COLOR}        color: rgba(198, 15, 19, 1)