*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables for the internet herokuapp login tests

*** Variables ***
${BASE_URL}         https://the-internet.herokuapp.com/login
${BROWSER}          chrome
${USERNAME}         tomsmith
${PASSWORD}         SuperSecretPassword!
${WRONG_PASSWORD}   SuperSecretPassword
${WRONG_USERNAME}   avec
${LOCATOR_USERNAME_INPUT}    id=username
${LOCATOR_PASSWORD_INPUT}    id=password
${LOCATOR_LOGIN_BUTTON}      xpath=//button[@class='radius']
${LOCATOR_FLASH_MESSAGE}     id=flash
${SUCCESS_MESSAGE}           You logged into a secure area!
${INVALID_PASSWORD_MSG}      Your password is invalid!
${INVALID_USERNAME_MSG}      Your username is invalid!
${FLASH_ERROR_COLOR}         rgba(185, 74, 72, 1)