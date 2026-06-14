*** Settings ***
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1781265114377_1/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1781265114377_1/resources/keywords.robot
Suite Setup     Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Suite Teardown  Close Browser
Test Setup      Go To    ${BASE_URL}