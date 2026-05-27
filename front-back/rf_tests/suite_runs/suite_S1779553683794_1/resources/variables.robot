*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for the internet herokuapp login tests

*** Variables ***
${BASE_URL}         https://the-internet.herokuapp.com/login
${BROWSER}          chrome
${USERNAME}         tomsmith
${VALID_PASSWORD}   SuperSecretPassword!
${WRONG_PASSWORD}   SuperSecretPassword
${WRONG_USERNAME}   wronguser
${USERNAME_FIELD}   id=username
${PASSWORD_FIELD}   id=password
${LOGIN_BUTTON}     xpath=//button[@class='radius']
${FLASH_MESSAGE}    id=flash
${FLASH_SUCCESS}    css=#flash.success
${FLASH_ERROR}      css=#flash.error
${SUCCESS_MSG}      You logged into a secure area!
${INVALID_PWD_MSG}  Your password is invalid!
${INVALID_USR_MSG}  Your username is invalid!
${SECURE_URL}       https://the-internet.herokuapp.com/secure