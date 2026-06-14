*** Settings ***
Suite Setup    Register Keyword To Run On Failure    Capture Page Screenshot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1781268605539_2/resources/variables.robot
Resource    C:/Users/Landing/Desktop/docDev/robotClaude/front-back/rf_tests/suite_runs/suite_S1781268605539_2/resources/keywords.robot
Test Setup      Open Browser No Popup    ${BASE_URL}    ${BROWSER}
Test Teardown   Close Browser