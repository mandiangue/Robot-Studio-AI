*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}       https://the-internet.herokuapp.com/login
${BROWSER}        chrome
${USERNAME}       tomsmith
${PASSWORD}       SuperSecretPassword!
${WRONG_PASSWORD}    SuperSecretPassword
${WRONG_USERNAME}    avec
${SUCCESS_MSG}    You logged into a secure area!
${ERROR_PASSWORD_MSG}    Your password is invalid!
${ERROR_USERNAME_MSG}    Your username is invalid!
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}      css=button[type='submit']
${FLASH_MSG}         id=flash