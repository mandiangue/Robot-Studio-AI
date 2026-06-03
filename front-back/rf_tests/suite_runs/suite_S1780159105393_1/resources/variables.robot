*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://the-internet.herokuapp.com/login
${BROWSER}          chrome
${USERNAME}         tomsmith
${PASSWORD}         SuperSecretPassword!
${WRONG_PASSWORD}   WrongPassword123
${WRONG_USERNAME}   wronguser
${URL}              https://the-internet.herokuapp.com/login
${USERNAME_FIELD}   id=username
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     css=button[type='submit']
${FLASH_MESSAGE}    id=flash
${LOGOUT_BUTTON}    css=.button.secondary.radius
${SUCCESS_MSG}      You logged into a secure area!
${WRONG_PASS_MSG}   Your password is invalid!
${WRONG_USER_MSG}   Your username is invalid!
${LOGOUT_MSG}       You logged out of the secure area!
${FLASH_COLOR}      rgba(198, 15, 19, 1)