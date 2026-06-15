// ============================================================================
// autocomplete.js — autocomplétion Robot Framework dans l'éditeur (IIFE autonome).
//                   Extrait de qa-agent.js.
// ============================================================================

// ── RF Autocomplete ──────────────────────────────────────────────────────────
(function(){
  var RF_COMPLETIONS = [
    // ── Sections RF
    '*** Settings ***','*** Variables ***','*** Test Cases ***','*** Keywords ***','*** Tasks ***',

    // ── Settings
    'Library','Resource','Variables',
    'Suite Setup','Suite Teardown','Test Setup','Test Teardown',
    'Test Template','Test Timeout','Documentation','Metadata',
    'Force Tags','Default Tags','Task Setup','Task Teardown',

    // ── Déclarations Library
    'Library    SeleniumLibrary',
    'Library    Browser',
    'Library    RequestsLibrary',
    'Library    Collections',
    'Library    String',
    'Library    BuiltIn',
    'Library    OperatingSystem',
    'Library    Process',
    'Library    DateTime',
    'Library    Screenshot',
    'Library    XML',
    'Library    JSON',

    // ── Resources communs
    'Resource    ../resources/keywords.robot',
    'Resource    ../resources/variables.robot',
    'Resource    ../resources/pages/main_page.robot',
    'Resource    variables.robot',
    'Resource    keywords.robot',
    'Resource    pages/main_page.robot',

    // ── Annotations
    '[Documentation]','[Tags]','[Setup]','[Teardown]',
    '[Template]','[Timeout]','[Arguments]','[Return]',

    // ── BDD
    'Given ','When ','Then ','And ','But ',

    // ── BuiltIn
    'Log','Log To Console','Log Many','Log Variables',
    'Should Be Equal','Should Be Equal As Strings','Should Be Equal As Numbers',
    'Should Contain','Should Not Contain','Should Start With','Should End With',
    'Should Be True','Should Be False','Should Be Empty','Should Not Be Empty',
    'Should Match','Should Match Regexp',
    'Run Keyword','Run Keyword If','Run Keyword Unless','Run Keywords',
    'Run Keyword And Return','Run Keyword And Return Status',
    'Run Keyword And Ignore Error','Run Keyword And Expect Error',
    'Wait Until Keyword Succeeds',
    'Set Variable','Set Variable If',
    'Set Global Variable','Set Suite Variable','Set Test Variable',
    'Get Variable Value','Variable Should Exist','Variable Should Not Exist',
    'Sleep','Catenate','Evaluate','Convert To String','Convert To Integer',
    'Convert To Number','Convert To Boolean','Convert To List',
    'Get Length','Length Should Be','Should Have Length',
    'Pass Execution','Pass Execution If','Fail','Skip','Skip If',
    'Comment','No Operation',
    'FOR    ${item}    IN    @{list}',
    'FOR    ${i}    IN RANGE    10',
    'FOR    ${key}    ${value}    IN    &{dict}',
    'IF    ${condition}','ELSE IF    ${condition}','ELSE','END',
    'WHILE    ${condition}',
    'TRY','EXCEPT','FINALLY','BREAK','CONTINUE',
    'RETURN',

    // ── SeleniumLibrary
    'Open Browser','Open Browser    ${URL}    ${BROWSER}',
    'Close Browser','Close All Browsers',
    'Get WebElements','Get WebElement',
    'Go To','Go Back','Go Forward','Reload Page',
    'Get Location','Get Title','Get Source',
    'Click Element','Click Button','Click Link','Click Image',
    'Double Click Element','Mouse Over',
    'Input Text','Input Password','Clear Element Text',
    'Press Keys','Press Key',
    'Submit Form',
    'Select From List By Value','Select From List By Label','Select From List By Index',
    'Unselect From List By Value','Unselect From List By Label',
    'Select All From List','Deselect All From List',
    'List Selection Should Be','List Should Have No Selections',
    'Select Checkbox','Unselect Checkbox',
    'Checkbox Should Be Selected','Checkbox Should Not Be Selected',
    'Choose File',
    'Element Should Be Visible','Element Should Not Be Visible',
    'Element Should Be Enabled','Element Should Be Disabled',
    'Element Should Be Focused',
    'Element Should Contain','Element Should Not Contain',
    'Element Text Should Be','Element Text Should Contain',
    'Element Attribute Value Should Be',
    'Wait Until Element Is Visible','Wait Until Element Is Not Visible',
    'Wait Until Element Is Enabled','Wait Until Element Contains',
    'Wait Until Page Contains','Wait Until Page Does Not Contain',
    'Wait Until Page Contains Element','Wait Until Page Does Not Contain Element',
    'Page Should Contain','Page Should Not Contain',
    'Page Should Contain Element','Page Should Not Contain Element',
    'Page Should Contain Button','Page Should Contain Checkbox',
    'Page Should Contain Link','Page Should Contain Textfield',
    'Get Text','Get Value','Get Element Attribute',
    'Get Element Count','Get Element Size','Get Element Location',
    'Get Horizontal Position','Get Vertical Position',
    'Execute Javascript','Execute Async Javascript',
    'Scroll Element Into View','Scroll To Element',
    'Drag And Drop','Drag And Drop By Offset',
    'Mouse Down','Mouse Up','Mouse Move',
    'Capture Page Screenshot','Capture Element Screenshot',
    'Set Selenium Speed','Set Selenium Timeout','Set Selenium Implicit Wait',
    'Set Browser Implicit Wait',
    'Maximize Browser Window','Set Window Size','Set Window Position',
    'Get Window Size','Get Window Position',
    'Switch Window','Get Window Handles','Get Window Title',
    'Close Window','Select Window',
    'Select Frame','Select Parent Frame','Unselect Frame',
    'Alert Should Be Present','Alert Should Not Be Present',
    'Handle Alert','Dismiss Alert','Accept Alert','Input Text Into Alert',
    'Get Alert Message',
    'Add Cookie','Get Cookie','Get Cookies','Delete Cookie','Delete All Cookies',
    'Assign Id To Element',
    'Locator Should Match X Times','XPath Should Match X Times',

    // ── Browser (Playwright)
    'New Browser','New Page','New Context',
    'Close Browser','Close Page','Close Context',
    'Go To','Take Screenshot',
    'Click','Click With Options',
    'Fill','Type Text','Press Keys','Clear Text',
    'Check','Uncheck','Select Options By','Deselect Options',
    'Get Text','Get Property','Get Attribute',
    'Get Element','Get Elements','Get Element Count',
    'Element Should Be Visible','Element Should Be Hidden',
    'Element Should Be Enabled','Element Should Be Disabled',
    'Wait For Elements State','Wait For Navigation',
    'Wait Until Network Is Idle',
    'Page Should Contain','Page Should Not Contain',
    'Get Title','Get Url',
    'Evaluate Javascript',
    'Scroll To','Scroll By',
    'Hover','Focus','Blur',
    'Upload File','Download',
    'Set Viewport Size','Get Viewport Size',
    'Switch Page','Switch Browser','Switch Context',
    'New Persistent Context',
    'Record Selector',
    'Promise To','Wait For Promise',
    'Run Async Keywords',

    // ── RequestsLibrary
    'Create Session','Create Client Cert Session',
    'Delete All Sessions',
    'GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS',
    'GET On Session','POST On Session','PUT On Session',
    'PATCH On Session','DELETE On Session','HEAD On Session',
    'Request Should Be Successful',
    'Status Should Be',
    'GET Request','POST Request','PUT Request','DELETE Request',
    'Response Should Contain Json',

    // ── Collections
    'Append To List','Insert Into List','Remove From List',
    'Remove Values From List','Remove Duplicates',
    'Get From List','Get Slice From List','Count Values In List',
    'Get Index From List','List Should Contain Value',
    'List Should Not Contain Value','List Should Contain Sub List',
    'Lists Should Be Equal','Sort List','Reverse List',
    'Set List Value','Copy List',
    'Create List','Create Dictionary',
    'Append To Dictionary','Get From Dictionary','Get Dictionary Keys',
    'Get Dictionary Values','Get Dictionary Items',
    'Keep In Dictionary','Remove From Dictionary',
    'Set To Dictionary','Pop From Dictionary',
    'Dictionary Should Contain Key','Dictionary Should Not Contain Key',
    'Dictionary Should Contain Value','Dictionary Should Not Contain Value',
    'Dictionary Should Contain Item','Dictionary Should Not Contain Item',
    'Dictionaries Should Be Equal','Copy Dictionary','Merge Dictionaries',
    'Get Match Count','Get Matches','Should Contain Match',

    // ── String
    'Get Regexp Matches','Replace String','Replace String Using Regexp',
    'Split String','Split String From Right','Split String To Characters',
    'Split To Lines','Join String','Join Strings',
    'Get Line','Get Line Count','Get Lines Containing String',
    'Get Lines Matching Pattern','Get Lines Matching Regexp',
    'Remove String','Remove String Using Regexp',
    'Convert To Lowercase','Convert To Uppercase','Convert To Title Case',
    'Strip String','Encode String To Bytes','Decode Bytes To String',
    'Format String','Generate Random String',
    'Should Be String','Should Not Be String',
    'Should Be Byte String','Should Not Be Byte String',
    'Should Be Unicode String','Should Not Be Unicode String',
    'String Should Match',

    // ── Variables communes SauceDemo
    '${URL}','${BROWSER}','${BASE_URL}',
    '${STANDARD_USER}','${LOCKED_USER}','${INVALID_USER}',
    '${PASSWORD}','${INVALID_PASSWORD}',
    '${USERNAME_INPUT}','${PASSWORD_INPUT}','${LOGIN_BUTTON}',
    '${ERROR_MESSAGE}','${INVENTORY_CONTAINER}',
    '${TIMEOUT}','${IMPLICIT_WAIT}',
  ];

  function getWordBefore(ta) {
    var val = ta.value;
    var pos = ta.selectionStart;
    var lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    var line = val.slice(lineStart, pos);
    var m = line.match(/[\w\$\{\}\*\[\]\/\.\-\_\s]+$/);
    if (!m) return '';
    // Pour les sections *** on prend tout depuis le début de ligne
    if (line.trimStart().startsWith('*')) return line.trimStart();
    // Sinon dernier mot
    var m2 = line.match(/[\w\$\{\}\*\[\]\/\.\-\_]+$/);
    return m2 ? m2[0] : '';
  }

  function getSuggestions(word) {
    if (!word || word.length < 2) return [];
    var w = word.toLowerCase();
    var exact = RF_COMPLETIONS.filter(function(c){ return c.toLowerCase().startsWith(w); });
    var contains = RF_COMPLETIONS.filter(function(c){
      return !c.toLowerCase().startsWith(w) && c.toLowerCase().indexOf(w) > -1;
    });
    return exact.concat(contains).slice(0, 14);
  }

  function removeDropdown() {
    var old = document.getElementById('_rfAcDropdown');
    if (old) old.remove();
  }

  function showDropdown(ta, suggestions, word) {
    removeDropdown();
    if (!suggestions.length) return;

    var taRect = ta.getBoundingClientRect();
    var lineHeight = parseInt(window.getComputedStyle(ta).lineHeight) || 18;
    var val = ta.value.slice(0, ta.selectionStart);
    var lineNum = (val.match(/\n/g)||[]).length;
    var approxTop = taRect.top + (lineNum + 1) * lineHeight - ta.scrollTop + 4;
    var approxLeft = taRect.left + 14;

    // S'assurer que le dropdown reste dans la fenêtre
    if (approxTop + 220 > window.innerHeight) approxTop = taRect.top - 220;

    var drop = document.createElement('div');
    drop.id = '_rfAcDropdown';
    drop.style.cssText = [
      'position:fixed',
      'z-index:99999',
      'background:#0d1117',
      'border:1px solid rgba(0,212,170,0.3)',
      'border-radius:8px',
      'box-shadow:0 8px 32px rgba(0,0,0,0.6)',
      'font-family:IBM Plex Mono,monospace',
      'font-size:12px',
      'max-height:240px',
      'overflow-y:auto',
      'min-width:280px',
      'max-width:480px',
      'top:' + approxTop + 'px',
      'left:' + approxLeft + 'px',
    ].join(';');

    // Header
    var hdr = document.createElement('div');
    hdr.style.cssText = 'padding:4px 10px;font-size:10px;color:rgba(0,212,170,0.5);border-bottom:1px solid rgba(0,212,170,0.1);letter-spacing:1px';
    hdr.textContent = 'RF COMPLETIONS';
    drop.appendChild(hdr);

    var selected = [0];

    suggestions.forEach(function(s, i) {
      var item = document.createElement('div');
      item.dataset.idx = i;
      // Catégorie
      var cat = '';
      var catColor = '#7dd3c8';
      if (s.startsWith('***')) { cat = 'section'; catColor = '#f59e0b'; }
      else if (s.startsWith('Library') || s.startsWith('Resource')) { cat = 'import'; catColor = '#c084fc'; }
      else if (s.startsWith('[')) { cat = 'setting'; catColor = '#60a5fa'; }
      else if (s.startsWith('${')) { cat = 'var'; catColor = '#22c55e'; }
      else if (s.startsWith('Given') || s.startsWith('When') || s.startsWith('Then') || s.startsWith('And') || s.startsWith('But')) { cat = 'bdd'; catColor = '#f59e0b'; }
      else if (s.startsWith('FOR') || s.startsWith('IF') || s.startsWith('WHILE') || s.startsWith('TRY') || s.startsWith('END') || s.startsWith('ELSE') || s.startsWith('RETURN') || s.startsWith('BREAK') || s.startsWith('CONTINUE')) { cat = 'control'; catColor = '#ef4444'; }
      else if (/^[A-Z]/.test(s)) { cat = 'keyword'; catColor = '#7dd3c8'; }

      item.style.cssText = 'padding:5px 10px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .08s;border-radius:0';
      if (i === 0) item.style.background = 'rgba(0,212,170,0.1)';

      var badge = document.createElement('span');
      badge.style.cssText = 'font-size:9px;padding:1px 5px;border-radius:3px;flex-shrink:0;opacity:0.8;background:rgba(255,255,255,0.05);color:' + catColor;
      badge.textContent = cat;

      var label = document.createElement('span');
      label.style.cssText = 'color:#e2e8f0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      var idx2 = s.toLowerCase().indexOf(word.toLowerCase());
      if (idx2 > -1) {
        label.innerHTML = escHtml(s.slice(0, idx2))
          + '<span style="color:' + catColor + ';font-weight:700">' + escHtml(s.slice(idx2, idx2 + word.length)) + '</span>'
          + escHtml(s.slice(idx2 + word.length));
      } else {
        label.textContent = s;
      }

      item.appendChild(badge);
      item.appendChild(label);

      item.onmouseenter = function() {
        selected[0] = i;
        updateSelection(drop, i);
      };
      item.onmousedown = function(e) {
        e.preventDefault();
        applyCompletion(ta, s, word);
        removeDropdown();
      };
      drop.appendChild(item);
    });

    document.body.appendChild(drop);
    ta._acSuggestions = suggestions;
    ta._acSelected = selected;
    ta._acWord = word;
  }

  function updateSelection(drop, idx) {
    var items = drop.querySelectorAll('[data-idx]');
    items.forEach(function(item, i) {
      item.style.background = i === idx ? 'rgba(0,212,170,0.1)' : 'transparent';
    });
    // Scroll into view
    if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
  }

  function applyCompletion(ta, completion, word) {
    var pos = ta.selectionStart;
    var val = ta.value;
    var start = pos - word.length;
    ta.value = val.slice(0, start) + completion + val.slice(pos);
    ta.selectionStart = ta.selectionEnd = start + completion.length;
    ta.dispatchEvent(new Event('input'));
    ta.focus();
  }

  function isRfCodeTextarea(ta) {
    // Vérifier que le textarea est dans un bloc de code RF (pas le chat)
    var el = ta;
    while (el) {
      if (el.id && el.id.startsWith('result-')) return true;
      if (el.id && el.id.startsWith('pulled-')) return true;
      if (el.className && el.className.includes('msg-bubble')) {
        // Dans un msg-bubble — vérifier si c'est un bloc de code (pas un message chat)
        return el.style && el.style.padding === '0px' || el.querySelector('pre');
      }
      el = el.parentElement;
    }
    return false;
  }

  function initAutocomplete(ta) {
    if (ta._rfAcInit) return;
    // Ne pas appliquer au textarea du chat ou autres textareas non-RF
    if (!isRfCodeTextarea(ta)) return;
    ta._rfAcInit = true;

    ta.addEventListener('input', function() {
      var word = getWordBefore(ta);
      var suggestions = getSuggestions(word);
      if (suggestions.length && word.length >= 2) {
        showDropdown(ta, suggestions, word);
      } else {
        removeDropdown();
      }
    });

    ta.addEventListener('keydown', function(e) {
      var drop = document.getElementById('_rfAcDropdown');
      if (!drop) return;
      var suggs = ta._acSuggestions || [];
      var selArr = ta._acSelected || [0];
      var sel = selArr[0];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        sel = Math.min(sel + 1, suggs.length - 1);
        selArr[0] = sel;
        updateSelection(drop, sel);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        sel = Math.max(sel - 1, 0);
        selArr[0] = sel;
        updateSelection(drop, sel);
      } else if (e.key === 'Tab') {
        if (suggs[sel]) {
          e.preventDefault();
          applyCompletion(ta, suggs[sel], ta._acWord || '');
          removeDropdown();
        }
      } else if (e.key === 'Enter') {
        var drop2 = document.getElementById('_rfAcDropdown');
        if (drop2 && suggs[sel]) {
          e.preventDefault();
          applyCompletion(ta, suggs[sel], ta._acWord || '');
          removeDropdown();
        }
      } else if (e.key === 'Escape') {
        removeDropdown();
      }
    });

    ta.addEventListener('blur', function() {
      setTimeout(removeDropdown, 180);
    });
  }

  // Observer pour les textareas créés dynamiquement
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'TEXTAREA') { initAutocomplete(node); return; }
        if (node.querySelectorAll) {
          // Chercher uniquement dans les blocs de code RF
          var rfBlocks = node.querySelectorAll('[id^="result-"], [id^="pulled-"]');
          rfBlocks.forEach(function(block) {
            block.querySelectorAll('textarea').forEach(function(ta) { initAutocomplete(ta); });
          });
          // Aussi si le node lui-même est un bloc RF
          if (node.id && (node.id.startsWith('result-') || node.id.startsWith('pulled-'))) {
            node.querySelectorAll('textarea').forEach(function(ta) { initAutocomplete(ta); });
          }
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Init sur les textareas existants
  document.addEventListener('DOMContentLoaded', function() {
    // Uniquement les textareas dans les blocs de code RF
    document.querySelectorAll('[id^="result-"] textarea, [id^="pulled-"] textarea').forEach(function(ta) {
      initAutocomplete(ta);
    });
  });

  window._rfInitAutocomplete = initAutocomplete;
})();
