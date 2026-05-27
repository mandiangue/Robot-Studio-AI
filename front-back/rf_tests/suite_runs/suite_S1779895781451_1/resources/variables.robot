*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}    https://the-internet.herokuapp.com/login
${BROWSER}    chrome
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}    css=button[type='submit']
${FLASH_MESSAGE}    id=flash
${LOGOUT_BUTTON}    css=.button.secondary.radius
${VALID_USERNAME}    tomsmith
${VALID_PASSWORD}    SuperSecretPassword!
${WRONG_PASSWORD}    WrongPassword123
${WRONG_USERNAME}    wronguser
${SUCCESS_MESSAGE}    You logged into a secure area!
${LOGOUT_MESSAGE}    You logged out of the secure area!
${INVALID_PASSWORD_MSG}    Your password is invalid!
${INVALID_USERNAME_MSG}    Your username is invalid!