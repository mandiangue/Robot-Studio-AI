// ============================================================================
// prompts.js — construction des prompts RF (getSessionRules, buildRfPrompt*),
//              getBrowserType, updateBrowserSelect. Extrait de qa-agent.js.
// ============================================================================

// ── Session mode rules for RF prompts ────────────────────────────────────────
function getSessionRules() {
  const mode = document.getElementById('optBrowserSession')?.value || 'per-test';
  const openBrowserKw = 'Open Browser No Popup';
  const openBrowserDef =
    '\n*** Keywords ***' +
    '\nOpen Browser No Popup' +
    '\n    [Arguments]    ${url}    ${browser}=chrome' +
    '\n    ${driver_path}=    Evaluate    __import__(\"sys\").path.insert(0,\"${EXECDIR}\") or __import__(\"NoPopupOptions\").get_driver_path(\"${browser}\")    sys,NoPopupOptions' +
    '\n    ${opts}=    Evaluate    __import__(\"NoPopupOptions\").get_no_popup_options(\"${browser}\")    NoPopupOptions' +
    '\n    ${is_chrome}=    Evaluate    \"${browser}\".lower() in (\"chrome\", \"chromium\")' +
    '\n    Run Keyword If    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}    options=${opts}' +
    '\n    Run Keyword Unless    ${is_chrome}    Open Browser    ${url}    ${browser}    executable_path=${driver_path}';

  if (mode === 'per-suite') {
    return 'SESSION=SUITE_TEARDOWN: '
      + 'Use keyword "Open Browser No Popup" in Suite Setup (not Open Browser directly). '
      + 'Close Browser once in Suite Teardown. '
      + 'DO NOT add Open Browser or Close Browser in any test case or keyword. '
      + 'Use Go To for navigation in tests. '
      + 'Settings must have: Suite Setup    Open Browser No Popup    ${URL}    ${BROWSER} and Suite Teardown    Close Browser. '
      + 'Add this keyword definition in keywords.robot: ' + openBrowserDef;
  } else {
    return 'SESSION=TEST_TEARDOWN: '
      + 'Use Test Setup    Open Browser No Popup    ${BASE_URL}    ${BROWSER} to open browser before each TC. '
      + 'Use Test Teardown    Close Browser to close browser after each TC. '
      + 'Settings must have: Test Setup    Open Browser No Popup    ${BASE_URL}    ${BROWSER} and Test Teardown    Close Browser. '
      + 'Add this keyword definition in keywords.robot: ' + openBrowserDef;
  }
}

function getBrowserType() {
  return document.getElementById('optBrowserType')?.value || 'chrome';
}

function updateBrowserSelect() {
  const lib = document.getElementById('optLibrary')?.value || 'SeleniumLibrary';
  const sel = document.getElementById('optBrowserType');
  const row = sel?.closest('.opt-row');
  if (!sel) return;
  const isPlaywright = lib === 'Browser';
  if (isPlaywright) {
    // Montrer le select avec les options Browser/Playwright
    if (row) row.style.display = '';
    sel.innerHTML = '<option value="chromium">🔵 Chromium</option><option value="firefox">🦊 Firefox</option><option value="webkit">🌿 WebKit</option>';
    if (!['chromium','firefox','webkit'].includes(sel.value)) sel.value = 'chromium';
  } else {
    // Cacher le select pour SeleniumLibrary (Chrome uniquement)
    if (row) row.style.display = 'none';
    sel.innerHTML = '<option value="chrome">🌐 Chrome</option>';
    sel.value = 'chrome';
  }
}

function buildRfPrompt(description, library, style, mode) {
  // Library-specific prompts — no POM for API/DB
  if (library === 'RequestsLibrary') {
    return buildRfPromptAPI(description, style);
  }
  if (library === 'DatabaseLibrary') {
    return buildRfPromptDB(description, style);
  }
  if (library === 'AppiumLibrary') {
    return buildRfPromptMobile(description, style);
  }

  // Browser (Playwright) — toujours son propre prompt, même en multi
  if (library === 'Browser') {
    return buildRfPromptBrowser(description, style);
  }
  // In multi-file mode, enforce POM structure with resources/ folder
  if (mode === 'multi') {
    return buildRfPromptPOM(description, library, style);
  }

  const styleMap = {
    'keyword-driven': 'Keyword-Driven with a clean reusable *** Keywords *** section.',
    'data-driven':    'Data-Driven with a Template and data sets.',
    'bdd':            'BDD with Given/When/Then/And/But prefixes in ENGLISH only.',
  };

  const modeInstr = mode === 'multi'
    ? `Génère PLUSIEURS fichiers séparés par des délimiteurs exactement comme ceci :
***** FILE: resources/variables.robot | variables | Variables globales
[contenu]

***** FILE: resources/keywords.robot | keywords | Keywords réutilisables
[contenu]

***** FILE: tests/test_sujet.robot | tests | Tests principaux
[contenu]`
    : 'Génère UN SEUL fichier .robot complet.';

  return `Tu es un expert Robot Framework. Réponds UNIQUEMENT avec le code .robot, aucune explication.

${modeInstr}

Règles :
- Librairie : ${library}
- Style : ${styleMap[style]}
- Variables externalisées dans *** Variables ***
- [Documentation] sur chaque test case
- [Teardown] quand un browser est ouvert
- Sélecteurs réalistes : id:, css:, xpath:
- Couvre tous les cas décrits + edge cases pertinents

Sujet à tester :
${description}`;
}


// ── RequestsLibrary prompt ───────────────────────────────────────────────────


function buildRfPromptBrowser(description, style) {
  const bdd = style === 'bdd';
  const bddNote = bdd ? 'Use BDD style: Given/When/Then/And/But prefixes on ALL test steps.' : 'Use Keyword-Driven style.';
  const lines = [
    'You are a Robot Framework + Browser library (Playwright) expert.',
    'Generate ONLY plain .robot code. NO markdown. NO explanations. NO code fences.',
    'Separate files with ***** FILE: delimiters EXACTLY as shown below.',
    '',
    'DESCRIPTION:',
    description,
    '',
    'STYLE: ' + bddNote,
    '',
    'OUTPUT - follow this EXACT structure:',
    '',
    '***** FILE: resources/variables.robot | variables | Variables',
    '*** Settings ***',
    'Documentation    Variables',
    '',
    '*** Variables ***',
    '${BASE_URL}      [the URL to test]',
    '${BROWSER}       ' + getBrowserType(),
    '${HEADLESS}      False',
    '[add all necessary variables - NO Suite Setup, NO keyword calls here]',
    '',
    '***** FILE: resources/keywords.robot | keywords | Keywords',
    '*** Settings ***',
    'Library      Browser',
    'Library      Collections',
    'Resource     variables.robot',
    'Resource     pages/main_page.robot',
    '',
    '*** Keywords ***',
    'Open Browser Session',
    '    [Arguments]    ${url}=${BASE_URL}    ${browser}=${BROWSER}',
    '    New Browser    ${browser}    headless=${HEADLESS}',
    '    New Context    acceptDownloads=True',
    '    New Page       ${url}',
    '',
    '[add business keywords here - each keyword does ONE thing]',
    '',
    '***** FILE: resources/pages/main_page.robot | page | Main Page',
    '*** Settings ***',
    'Documentation    Page Object for the application (ALL selectors here)',
    'Library          Browser',
    'Resource         ../variables.robot',
    '',
    '*** Keywords ***',
    '[page object keywords using Browser library only]',
    '',
    '***** FILE: tests/feature_main.robot | tests | Main Tests',
    '*** Settings ***',
    'Suite Setup       Open Browser Session    ${BASE_URL}',
    'Suite Teardown    Close Browser',
    'Test Setup        Go To    ${BASE_URL}',
    'Test Teardown     Take Screenshot',
    'Documentation     [test suite description]',
    'Library           Browser',
    'Resource          ../resources/variables.robot',
    'Resource          ../resources/keywords.robot',
    'Resource          ../resources/pages/main_page.robot',
    '',
    '*** Test Cases ***',
    '[test cases here - each calls keywords with proper arguments]',
    '',
    '',
    'CRITICAL RULES - NEVER BREAK THESE:',
    '',
    '1. SELECTORS - always use unique, specific selectors:',
    '   GOOD: id=username  css=[data-test="login-button"]  css=[data-test="inventory-item-name"]:first-child',
    '   BAD:  css=.inventory_item_name  (matches multiple elements - strict mode violation)',
    '   Use data-test attributes: css=[data-test="xxx"]',
    '',
    '2. VARIABLE ASSIGNMENTS - NEVER as BDD steps:',
    '   WRONG: Then ${prices}=    Get Prices List',
    '   RIGHT: Put assignments INSIDE keyword definitions only',
    '',
    '3. BDD STEPS - only keyword calls, no assignments:',
    '   Every step: Given/When/Then/And/But [Keyword Name]    [args]',
    '   NO variable assignments as test case steps',
    '',
    '4. ARGUMENTS - always pass all required arguments',
    '',
    '5. BROWSER KEYWORDS (use these, NOT SeleniumLibrary):',
    '   Fill Text    locator    text',
    '   Click    locator',
    '   Wait For Elements State    locator    visible    timeout=10s',
    '   Get Text    locator',
    '   Get Url',
    '   Go To    url',
    '   Take Screenshot',
    '',
    '6. Suite Setup calls "Open Browser Session" ONLY',
    '7. variables.robot has ONLY *** Settings *** + *** Variables ***',
    '8. Use EXACTLY the browser value shown in the template: ' + getBrowserType() + ' — do NOT change it to chrome or any other value',
    '',
    bdd ? '- BDD: Given/When/Then/And in English' : '',
    getSessionRules(),
  ];
  return lines.filter(function(l){ return l !== false; }).join('\n');
}


function buildRfPromptBrowser_OLD(description, style) {
  const bdd = style === 'bdd';
  const lines = [
    'You are a Robot Framework expert using the Browser library (Playwright).',
    'Generate plain .robot files only. NO markdown. ALL keyword names in English.',
    '',
    '=== CRITICAL RULES — VIOLATION CAUSES RUNTIME ERRORS ===',
    '',
    '1. NEVER put "New Page" or "New Browser" inside *** Settings ***.',
    '   *** Settings *** only accepts: Library, Resource, Variables, Suite Setup,',
    '   Suite Teardown, Test Setup, Test Teardown, Documentation, Metadata, Tags.',
    '',
    '2. Suite Setup MUST call a single keyword that does: New Browser + New Context + New Page.',
    '   Example in keywords.robot:',
    '   Open Browser Session',
    '       [Arguments]    ${url}    ${browser}=chromium',
    '       New Browser    ${browser}    headless=False',
    '       New Context    acceptDownloads=True',
    '       New Page       ${url}',
    '',
    '3. variables.robot must ONLY contain *** Settings *** (Library/Resource/Documentation)',
    '   and *** Variables ***. NEVER any keyword calls.',
    '',
    '4. Test Teardown: use "Take Screenshot" NOT "Capture Page Screenshot".',
    '',
    '5. Suite Teardown: always "Close Browser".',
    '',
    '=== CORRECT STRUCTURE ===',
    '',
    '--- resources/variables.robot ---',
    '*** Settings ***',
    'Documentation    Variables',
    '',
    '*** Variables ***',
    '${BASE_URL}      https://example.com',
    '${BROWSER}       ' + getBrowserType(),
    '${HEADLESS}      False',
    '',
    '--- resources/keywords.robot ---',
    '*** Settings ***',
    'Library      Browser',
    'Library      Collections',
    'Resource     variables.robot',
    'Resource     pages/main_page.robot',
    '',
    '*** Keywords ***',
    'Open Browser Session',
    '    [Arguments]    ${url}    ${browser}=chromium',
    '    New Browser    ${browser}    headless=${HEADLESS}',
    '    New Context    acceptDownloads=True',
    '    New Page       ${url}',
    '',
    '--- resources/pages/page.robot ---',
    '*** Settings ***',
    'Library      Browser',
    'Resource     ../variables.robot',
    '',
    '*** Keywords ***',
    '# Page Object keywords using Browser library',
    '',
    '--- tests/tests.robot ---',
    '*** Settings ***',
    'Suite Setup       Open Browser Session    ${BASE_URL}',
    'Suite Teardown    Close Browser',
    'Test Setup        Go To    ${BASE_URL}',
    'Test Teardown     Take Screenshot',
    'Library           Browser',
    'Resource          ../resources/variables.robot',
    'Resource          ../resources/keywords.robot',
    '',
    '*** Test Cases ***',
    '# Tests here',
    '',
    '=== BROWSER LIBRARY KEYWORDS (use these, NOT SeleniumLibrary) ===',
    'Fill Text    locator    text          # NOT Input Text',
    'Click    locator                      # NOT Click Element',
    'Wait For Elements State    locator    visible    timeout=10s',
    'Get Text    locator    ==    expected  # assertion inline',
    'Get Text    locator                   # returns string',
    'Get Url    ==    ${EXPECTED_URL}      # assert URL',
    'Get Title    ==    ${EXPECTED_TITLE}',
    'Take Screenshot                       # NOT Capture Page Screenshot',
    'Scroll To    locator',
    'Hover    locator',
    'Select Options By    locator    value    optionValue',
    'Check Checkbox    locator',
    'Upload File By Selector    locator    /path/to/file',
    'Wait For Navigation',
    'Wait Until Network Is Idle',
    'Evaluate Javascript    document.title',
    'New Page    ${URL}                    # opens new tab',
    'Switch Page    NEW                    # switch to new tab',
    'Go To    ${URL}                       # navigate',
    'Go Back',
    '',
    '=== CSS SELECTORS ===',
    'id=username          → css=#username or id=username',
    'css=.classname',
    'css=button[type="submit"]',
    'xpath=//div[@id="x"]',
    'text=Click me        → finds by text content',
    '',
    '=== DESCRIPTION TO TEST ===',
    description,
    '',
    'OUTPUT FORMAT — MANDATORY:',
    'Separate each file with this exact delimiter:',
    '***** FILE: resources/variables.robot | variables | Variables',
    '[content of variables.robot]',
    '',
    '***** FILE: resources/keywords.robot | keywords | Keywords',
    '[content of keywords.robot]',
    '',
    '***** FILE: resources/pages/login_page.robot | page | Login Page',
    '[content of login_page.robot]',
    '',
    '***** FILE: tests/feature_main.robot | tests | Main Tests',
    '[content of feature_main.robot]',
    '',
    'ADDITIONAL RULES:',
    '- ALWAYS use ***** FILE: delimiter before each file — this is mandatory',
    '- Generate: variables.robot, keywords.robot, pages/*.robot, and ONE tests/feature_<page>.robot PER page object',
    '- Always define [Arguments] and pass them when calling keywords',
    '- Add [Documentation] to every keyword and test case',
    '- Add [Tags] to every test case',
    '- Align columns with spaces for readability',
    '- Variables in variables.robot, NO hardcoded values in tests',
    '- keywords.robot must contain "Open Browser Session" keyword',
    '- each tests/feature_*.robot Suite Setup must call "Open Browser Session    ${BASE_URL}"',
    bdd ? '- BDD style: Given/When/Then/And/But prefixes on all test steps' : '- Keyword-Driven style: descriptive keyword names',
    getSessionRules(),
  ];
  return lines.filter(l => l !== false && l !== '').join('\n');
}

function buildRfPromptMobile(description, style) {
  const bdd = style === 'bdd';
  const lines = [
    'You are a Robot Framework expert for mobile web testing with AppiumLibrary.',
    'Generate plain .robot files only. NO markdown. NO explanations.',
    'Testing a WEBSITE on a real Android device via Chrome browser — NOT a native app.',
    'Separate files with ***** FILE: delimiters EXACTLY as shown.',
    '',
    'DESCRIPTION:',
    description,
    '',
    'STYLE: ' + (bdd ? 'BDD style: Given/When/Then/And/But prefixes.' : 'Keyword-Driven style.'),
    '',
    'OUTPUT — follow this EXACT structure:',
    '',
    '***** FILE: resources/variables.robot | variables | Variables',
    '*** Settings ***',
    'Documentation    Mobile Variables',
    '',
    '*** Variables ***',
    '${APPIUM_SERVER}    http://127.0.0.1:4723',
    '${PLATFORM}         Android',
    '${DEVICE_NAME}      [device name]',
    '${AUTOMATION}       UiAutomator2',
    '${BASE_URL}         [URL to test]',
    '[add all necessary variables]',
    '',
    '***** FILE: resources/keywords.robot | keywords | Keywords',
    '*** Settings ***',
    'Library      AppiumLibrary',
    'Library      Collections',
    'Resource     variables.robot',
    '',
    '*** Keywords ***',
    'Open Mobile Browser',
    '    [Arguments]    ${url}=${BASE_URL}',
    '    Open Application    ${APPIUM_SERVER}',
    '    ...    platformName=${PLATFORM}',
    '    ...    deviceName=${DEVICE_NAME}',
    '    ...    automationName=${AUTOMATION}',
    '    ...    browserName=Chrome',
    '    Go To Url    ${url}',
    '',
    'Close Mobile Browser',
    '    Close Application',
    '',
    '[add business keywords here]',
    '',
    '***** FILE: tests/feature_main.robot | tests | Main Tests',
    '*** Settings ***',
    'Suite Setup       Open Mobile Browser    ${BASE_URL}',
    'Suite Teardown    Close Mobile Browser',
    'Documentation     [test suite description]',
    'Library           AppiumLibrary',
    'Resource          ../resources/variables.robot',
    'Resource          ../resources/keywords.robot',
    '',
    '*** Test Cases ***',
    '[test cases here]',
    '',
    'RULES:',
    '- Use xpath= selectors: xpath=//input[@id="username"]',
    '- Always Wait Until Element Is Visible before any interaction',
    '- Close Application (NOT Close Browser)',
    '- NO Open Browser or SeleniumLibrary/Browser keywords',
    '- [Documentation] on every keyword and test case',
    '- [Tags] on every test case',
    bdd ? '- Given/When/Then/And in English' : '',
    getSessionRules(),
  ];
  return lines.filter(function(l){ return l !== false; }).join('\n');
}




function buildRfPromptAPI(description, style) {
  const bdd = style === 'bdd';
  const bddNote = bdd ? 'BDD style: Given/When/Then/And/But prefixes on ALL steps.' : 'Keyword-Driven style.';
  const lines = [
    'You are a Robot Framework expert for REST API testing with RequestsLibrary.',
    'Generate plain .robot files only. NO markdown. NO explanations.',
    'Separate files with ***** FILE: delimiters EXACTLY as shown.',
    '',
    'DESCRIPTION:',
    description,
    '',
    'STYLE: ' + bddNote,
    '',
    'OUTPUT — follow this EXACT structure:',
    '',
    '***** FILE: resources/variables.robot | variables | Variables',
    '*** Settings ***',
    'Documentation    Variables API',
    '',
    '*** Variables ***',
    '${BASE_URL}         [the API base URL]',
    '${CONTENT_TYPE}     application/json',
    '[add all necessary variables]',
    '',
    '***** FILE: resources/keywords.robot | keywords | Keywords',
    '*** Settings ***',
    'Library      RequestsLibrary',
    'Library      Collections',
    'Library      String',
    'Resource     variables.robot',
    '',
    '*** Keywords ***',
    'Create API Session',
    '    Create Session    api    ${BASE_URL}    headers={"Content-Type": "${CONTENT_TYPE}"}',
    '',
    'Close API Session',
    '    Delete All Sessions',
    '',
    '[add business keywords here]',
    '',
    '***** FILE: tests/feature_main.robot | tests | Main Tests',
    '*** Settings ***',
    'Suite Setup       Create API Session',
    'Suite Teardown    Close API Session',
    'Documentation     [test suite description]',
    'Library           RequestsLibrary',
    'Library           Collections',
    'Resource          ../resources/variables.robot',
    'Resource          ../resources/keywords.robot',
    '',
    '*** Test Cases ***',
    '[test cases here]',
    '',
    'RULES:',
    '- NO Open Browser or SeleniumLibrary/Browser keywords',
    '- Use GET On Session, POST On Session, PUT On Session, DELETE On Session',
    '- Always validate status_code AND response body',
    '- ${resp}=    GET On Session    api    /endpoint',
    '- Should Be Equal As Integers    ${resp.status_code}    200',
    '- [Documentation] on every keyword and test case',
    '- [Tags] on every test case',
    bdd ? '- Given/When/Then/And in English' : '',
    getSessionRules(),
  ];
  return lines.filter(function(l){ return l !== false; }).join('\n');
}




function buildRfPromptDB(description, style) {
  const bdd = style === 'bdd';
  const lines = [
    'You are a Robot Framework expert for database testing with DatabaseLibrary.',
    'Generate plain .robot files only. NO markdown. NO explanations.',
    'Separate files with ***** FILE: delimiters EXACTLY as shown.',
    '',
    'DESCRIPTION:',
    description,
    '',
    'STYLE: ' + (bdd ? 'BDD style: Given/When/Then/And/But prefixes.' : 'Keyword-Driven style.'),
    '',
    'OUTPUT — follow this EXACT structure:',
    '',
    '***** FILE: resources/variables.robot | variables | Variables',
    '*** Settings ***',
    'Documentation    Database Variables',
    '',
    '*** Variables ***',
    '${DB_MODULE}    pymysql',
    '${DB_HOST}      localhost',
    '${DB_PORT}      3306',
    '${DB_NAME}      [database name]',
    '${DB_USER}      [username]',
    '${DB_PASS}      [password]',
    '[add all necessary variables]',
    '',
    '***** FILE: resources/keywords.robot | keywords | Keywords',
    '*** Settings ***',
    'Library      DatabaseLibrary',
    'Library      Collections',
    'Resource     variables.robot',
    '',
    '*** Keywords ***',
    'Connect To DB',
    '    Connect To Database    ${DB_MODULE}    ${DB_NAME}    ${DB_USER}    ${DB_PASS}    ${DB_HOST}    ${DB_PORT}',
    '',
    'Disconnect From DB',
    '    Disconnect From Database',
    '',
    '[add business keywords here]',
    '',
    '***** FILE: tests/feature_main.robot | tests | Main Tests',
    '*** Settings ***',
    'Suite Setup       Connect To DB',
    'Suite Teardown    Disconnect From DB',
    'Documentation     [test suite description]',
    'Library           DatabaseLibrary',
    'Library           Collections',
    'Resource          ../resources/variables.robot',
    'Resource          ../resources/keywords.robot',
    '',
    '*** Test Cases ***',
    '[test cases here]',
    '',
    'RULES:',
    '- NO Open Browser or SeleniumLibrary/Browser keywords',
    '- Use: Table Must Exist, Row Count Is Greater Than X, Execute SQL String, Check If Exists In Database',
    '- Always validate data, row counts, column values',
    '- [Documentation] on every keyword and test case',
    '- [Tags] on every test case',
    bdd ? '- Given/When/Then/And in English' : '',
    getSessionRules(),
  ];
  return lines.filter(function(l){ return l !== false; }).join('\n');
}





function buildRfPromptPOM(description, library, style) {
  const styleGuide = style === 'bdd' ? 'BDD — ALL keyword names in English (Given/When/Then/And/But)' : style === 'data-driven' ? 'Data-Driven' : 'Keyword-Driven — ALL keyword names in English';

  // Detect pages from multi-block description
  const pages = [];
  description.split('=== PAGE :').slice(1).forEach(p => {
    const label = p.split('===')[0].trim();
    if (label) pages.push(label);
  });
  if (pages.length === 0) pages.push('Main');

  const totalTcCount = pages.reduce((s, p) => s + (p.cases||[]).length, 0);
  let prompt = 'Tu es un expert Robot Framework. Génère EXACTEMENT ces ' + (pages.length + 3) + ' fichiers POM.\n';
  prompt += 'Style: ' + styleGuide + ' | Library: ' + library + '\n';
  prompt += '⚠️ Les fichiers tests/feature_*.robot DOIVENT contenir AU TOTAL EXACTEMENT ' + totalTcCount + ' Test Cases — un par cas listé.\n\n';
  prompt += '⚠️ RÈGLES ABSOLUES :\n';
  prompt += '- Texte brut uniquement, JAMAIS de balises markdown.\n';
  prompt += '- Tous les noms de keywords en ANGLAIS.\n';
  prompt += '- COHÉRENCE STRICTE : chaque keyword appelé dans les fichiers tests/ DOIT être défini AVEC LE MÊME NOM EXACT dans keywords.robot ou pages/*.robot.\n';
  prompt += '- Exemple correct :\n';
  prompt += '  keywords.robot  → "Open Login Page"\n';
  prompt += '  feature_*.robot → "Given Open Login Page" (même nom après le préfixe BDD)\n';
  prompt += '- Exemple INTERDIT :\n';
  prompt += '  keywords.robot  → "Open Login Page"\n';
  prompt += '  feature_*.robot → "Given User Opens The Login Page" (nom différent)\n';
  prompt += '- Génère TOUJOURS keywords.robot AVANT les fichiers tests/ pour garantir la cohérence.\n';
  prompt += '- INTERDIT dans variables.robot, keywords.robot et pages/*.robot : Suite Setup, Suite Teardown, Test Setup, Test Teardown, Test Template, Force Tags, Default Tags. Ces settings ne sont autorisés QUE dans tests.robot.\n';
  prompt += '- variables.robot EST UN FICHIER RESOURCE — il ne contient QUE *** Settings *** (Documentation, Library, Resource) et *** Variables ***.\n\n';
  prompt += 'DESCRIPTION:\n' + description + '\n\n';
  prompt += 'FORMAT OBLIGATOIRE — commence chaque fichier par ***** FILE: chemin | label | desc\n\n';

  // 1. variables.robot
  prompt += '***** FILE: resources/variables.robot | variables | Variables\n';
  prompt += '*** Settings ***\nDocumentation    Variables\n\n*** Variables ***\n${BASE_URL}    https://...\n${BROWSER}    chrome\n# Sélecteurs\n\n';

  // 2. page files
  pages.forEach(p => {
    const fname = p.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_') + '_page.robot';
    prompt += '***** FILE: resources/pages/' + fname + ' | page | ' + p + '\n';
    prompt += '*** Settings ***\nDocumentation    Page Object ' + p + '\nLibrary    ' + library + '\nResource    ../variables.robot\n\n*** Keywords ***\n# Actions ' + p + '\n\n';
  });

  // 3. keywords.robot
  prompt += '***** FILE: resources/keywords.robot | keywords | Keywords\n';
  prompt += '*** Settings ***\nDocumentation    Keywords métier\nLibrary    ' + library + '\nResource    variables.robot\n';
  pages.forEach(p => {
    const fname = p.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_') + '_page.robot';
    prompt += 'Resource    pages/' + fname + '\n';
  });
  prompt += '\n*** Keywords ***\n# ' + styleGuide + '\n\n';

  // 4. fichiers tests — un par fonctionnalité si > 1 page
  if (pages.length > 1) {
    prompt += '\n⚠️ FICHIERS TESTS MULTIPLES — crée UN fichier par fonctionnalité :\n';
    prompt += '- Format : tests/feature_<nom>.robot (ex: feature_login.robot, feature_cart.robot)\n';
    prompt += '- Chaque fichier contient UNIQUEMENT les TC de sa fonctionnalité\n';
    prompt += '- NE PAS créer tests/tests.robot dans ce cas\n\n';
    pages.forEach(p => {
      const fname = 'feature_' + p.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_') + '.robot';
      prompt += '***** FILE: tests/' + fname + ' | tests | Tests ' + p + '\n';
      prompt += '*** Settings ***\nDocumentation    Tests ' + p + '\nLibrary    ' + library + '\nResource    ../resources/variables.robot\nResource    ../resources/keywords.robot\n\n*** Test Cases ***\n# TC liés à ' + p + '\n\n';
    });
    prompt += 'RAPPEL: Génère ' + (pages.length + 3) + ' fichiers avec leur contenu RF complet.\n';
  } else {
    // Une seule page — nommer le fichier selon la page
    const singlePage = pages[0];
    const singleFname = 'feature_' + singlePage.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/_+/g,'_') + '.robot';
    prompt += '***** FILE: tests/' + singleFname + ' | tests | Tests ' + singlePage + '\n';
    prompt += '*** Settings ***\nDocumentation    Tests ' + singlePage + '\nLibrary    ' + library + '\nResource    ../resources/variables.robot\nResource    ../resources/keywords.robot\n\n*** Test Cases ***\n# Tests basés sur les cas décrits\n\n';
    prompt += 'RAPPEL: Génère les ' + (pages.length + 3) + ' fichiers ci-dessus avec leur contenu Robot Framework complet.\n';
    prompt += 'Le fichier tests/' + singleFname + ' EST OBLIGATOIRE — il contient les Test Cases.\n';
  }
  prompt += 'RAPPEL: Génère les ' + (pages.length + 3) + ' fichiers ci-dessus avec leur contenu Robot Framework complet.\n';

  return prompt;
}


