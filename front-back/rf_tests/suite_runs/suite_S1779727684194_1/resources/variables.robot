*** Settings ***
Test Teardown    Capture Page Screenshot
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}       https://the-internet.herokuapp.com/login
${BROWSER}        chrome
${VALID_USER}     tomsmith
${VALID_PASS}     SuperSecretPassword!
${WRONG_PASS}     WrongPassword123
${WRONG_USER}     unknownuser
${USERNAME_FIELD}    id=username
${PASSWORD_FIELD}    id=password
${LOGIN_BUTTON}      xpath=//button[@class='radius']
${FLASH_MESSAGE}     id=flash
${LOGOUT_BUTTON}     css=.button.secondary.radius