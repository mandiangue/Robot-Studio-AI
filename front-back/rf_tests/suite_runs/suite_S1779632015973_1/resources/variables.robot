*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for the login test suite

*** Variables ***
${BASE_URL}           https://the-internet.herokuapp.com/login
${BROWSER}            chrome
${USERNAME_VALID}     tomsmith
${PASSWORD_VALID}     SuperSecretPassword!
${PASSWORD_WRONG}     Superpassword!
${USERNAME_WRONG}     wronguser
${LOGIN_TITLE}        Login Page
${SECURE_URL}         https://the-internet.herokuapp.com/secure
${MSG_LOGIN_OK}       You logged into a secure area!
${MSG_LOGIN_FAIL_PW}  Your password is invalid!
${MSG_LOGIN_FAIL_USR} Your username is invalid!
${MSG_LOGOUT}         You logged out of the secure area!
${INPUT_USERNAME}     id=username
${INPUT_PASSWORD}     id=password
${BTN_LOGIN}          xpath=//button[@class='radius']
${BTN_LOGOUT}         css=a.button.secondary.radius
${FLASH_MESSAGE}      id=flash