Recruiter → Lever Chrome Extension
==================================

Install:
1. Extract this ZIP.
2. Open Chrome.
3. Go to chrome://extensions
4. Turn on Developer mode.
5. Click "Load unpacked".
6. Select the extracted recruiter-lever-extension folder.

Test:
1. Open a LinkedIn Recruiter Lite candidate profile.
2. Click the extension icon.
3. Click "Save Current Candidate".
4. Open the Lever candidate-entry page.
5. Click the extension icon.
6. Select the saved candidate.
7. Click "Fill Lever".

Notes:
- The extension stores the five most recent candidates locally using chrome.storage.local.
- DOM selectors were built from the tested LinkedIn Recruiter Lite and Lever pages.
- If LinkedIn or Lever changes their DOM, selectors may need updates.
- Use only with data and workflows your organization is authorized to access.