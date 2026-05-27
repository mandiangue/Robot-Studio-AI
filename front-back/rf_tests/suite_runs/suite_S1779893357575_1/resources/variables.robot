*** Settings ***
Test Teardown    Capture Page Screenshot
Suite Setup       Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close Browser
Documentation    Variables

*** Variables ***
${BASE_URL}       https://the-internet.herokuapp.com/login
${BROWSER}        chrome
${USERNAME}       tomsmith
${VALID_PASS}     SuperSecretPassword!
${WRONG_PASS}     WrongPassword123
${WRONG_USER}     wronguser
${LOC_USERNAME}   id=username
${LOC_PASSWORD}   id=password
${LOC_SUBMIT}     css=button[type='submit']
${LOC_FLASH}      id=flash
${LOC_LOGOUT}     css=.button.secondary.radius