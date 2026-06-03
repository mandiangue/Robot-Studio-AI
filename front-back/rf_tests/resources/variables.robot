*** Settings ***
Documentation    Variables



*** Variables ***
${BASE_URL}       https://the-internet.herokuapp.com/login
${URL}            https://the-internet.herokuapp.com/login
${BROWSER}        chrome
${USERNAME}       tomsmith
${PASSWORD}       SuperSecretPassword!
${WRONG_PASSWORD}    WrongPassword123
${WRONG_USERNAME}    unknownuser
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}      css=button[type='submit']
${SUCCESS_MSG}       You logged into a secure area!
${WRONG_PASS_MSG}    Your password is invalid!
${WRONG_USER_MSG}    Your username is invalid!
${LOGOUT_MSG}        You logged out of the secure area!
${FLASH_MSG}         id=flash
${LOGOUT_BUTTON}     css=.button.secondary.radius
${FLASH_ERROR_COLOR}    rgba(198, 15, 19, 1)
${VALID_USER}    tomsmith
${VALID_PASS}    SuperSecretPassword!
${WRONG_USER}    wronguser
${WRONG_PASS}    WrongPassword
${FLASH_MESSAGE}     id=flash