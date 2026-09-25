console.log("Recruiter → Lever LinkedIn script loaded");


// ==========================================
// HELPERS
// ==========================================

function text(selector, root = document) {
  return root.querySelector(selector)?.innerText.trim() || null;
}


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ==========================================
// PUBLIC LINKEDIN PROFILE URL
// ==========================================

async function getPublicProfileUrl() {
  const button = document.querySelector(
    '[data-test-public-profile-trigger]'
  );

  if (!button) {
    console.warn("Public profile button not found");
    return null;
  }

  button.click();

  await wait(500);

  const publicProfileLink = [
    ...document.querySelectorAll(
      'a[href*="linkedin.com/in/"]'
    )
  ].find(a =>
    a.href.includes("linkedin.com/in/")
  );

  const url =
    publicProfileLink?.href || null;

  console.log(
    "Public LinkedIn URL:",
    url
  );

  return url;
}


// ==========================================
// SCRAPE CURRENT CANDIDATE
// ==========================================

async function scrapeCandidate() {

  // ------------------------------------------
  // EXPERIENCE HISTORY
  // ------------------------------------------

  const experiences = [
    ...document.querySelectorAll(
      '[data-test-position-list-container]'
    )
  ].map(position => ({

    title:
      text(
        '[data-test-position-entity-title]',
        position
      ),

    company:
      text(
        '[data-test-position-entity-company-link]',
        position
      ) ||
      text(
        '[data-test-position-entity-company-without-link]',
        position
      ),

    companyUrl:
      position.querySelector(
        '[data-test-position-entity-company-link]'
      )?.href || null,

    dates:
      text(
        '[data-test-position-entity-date-range]',
        position
      ),

    duration:
      text(
        '[data-test-position-entity-duration]',
        position
      ),

    location:
      text(
        '[data-test-position-entity-location]',
        position
      ),

    description:
      text(
        '[data-test-position-entity-description]',
        position
      )

  }));


  // ------------------------------------------
  // PUBLIC LINK
  // ------------------------------------------

  const publicLinkedInUrl =
    await getPublicProfileUrl();


  // ------------------------------------------
  // CANDIDATE OBJECT
  // ------------------------------------------

  const candidate = {

    name:
      text(
        '.artdeco-entity-lockup__title'
      ),

    email:
      text(
        '[data-test-contact-email-address]'
      ),

    phone:
      text(
        '[data-test-contact-phone-number]'
      ) ||
      text(
        'a[href^="tel:"]'
      ),

    location:
      text(
        '[data-test-row-lockup-location]'
      )
        ?.replace(/^·\s*/, '')
        .trim() || null,

    experiences,

    // Most recent experience
    company:
      experiences[0]?.company || null,

    title:
      experiences[0]?.title || null,

    // Public LinkedIn profile if available
    linkedin:
      publicLinkedInUrl ||
      window.location.href,

    // Keep Recruiter Lite URL separately
    recruiterUrl:
      window.location.href,

    savedAt:
      new Date().toISOString()
  };


  console.log(
    "Candidate scraped:",
    candidate
  );

  return candidate;
}


// ==========================================
// LISTEN FOR EXTENSION POPUP
// ==========================================

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {

    if (
      message.action ===
      "SCRAPE_CANDIDATE"
    ) {

      scrapeCandidate()
        .then(candidate => {

          sendResponse({
            success: true,
            candidate
          });

        })
        .catch(error => {

          console.error(
            "Candidate scrape failed:",
            error
          );

          sendResponse({
            success: false,
            error: error.message
          });

        });


      // IMPORTANT:
      // Keeps the Chrome message channel open
      // while scrapeCandidate() runs asynchronously.
      return true;
    }

  }
);