*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}         https://the-internet.herokuapp.com/login
${BROWSER}          chrome
${USERNAME_FIELD}   id=username
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     css=button[type='submit']
${FLASH_MESSAGE}    id=flash
${LOGOUT_BUTTON}    css=.button.secondary.radius
${VALID_USER}       tomsmith
${VALID_PASS}       SuperSecretPassword!
${WRONG_PASS}       WrongPassword123
${WRONG_USER}       wronguser