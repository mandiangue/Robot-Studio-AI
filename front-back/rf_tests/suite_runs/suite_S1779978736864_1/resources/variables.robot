*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}       https://the-internet.herokuapp.com/login
${BROWSER}        chrome
${USERNAME}       tomsmith
${PASSWORD}       SuperSecretPassword!
${WRONG_PASSWORD}    WrongPassword123
${WRONG_USERNAME}    unknownuser
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}      css=button[type='submit']
${SUCCESS_MSG}       You logged into a secure area!
${ERROR_PASSWORD}    Your password is invalid!
${ERROR_USERNAME}    Your username is invalid!
${LOGOUT_MSG}        You logged out of the secure area!
${LOGOUT_BUTTON}     css=.button.secondary.radius
${FLASH_MSG}         id=flash