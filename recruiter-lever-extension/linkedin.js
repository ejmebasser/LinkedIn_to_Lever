console.log("Recruiter → Lever LinkedIn script loaded");

function text(selector, root = document) {
  return root.querySelector(selector)?.innerText.trim() || null;
}

function scrapeCandidate() {
  const experiences = [
    ...document.querySelectorAll('[data-test-position-list-container]')
  ].map(position => ({
    title: text('[data-test-position-entity-title]', position),

    company:
      text('[data-test-position-entity-company-link]', position) ||
      text('[data-test-position-entity-company-without-link]', position),

    companyUrl:
      position.querySelector('[data-test-position-entity-company-link]')?.href || null,

    dates: text('[data-test-position-entity-date-range]', position),
    duration: text('[data-test-position-entity-duration]', position),
    location: text('[data-test-position-entity-location]', position),
    description: text('[data-test-position-entity-description]', position)
  }));

  const candidate = {
    name: text('.artdeco-entity-lockup__title'),
    email: text('[data-test-contact-email-address]'),

    phone:
      text('[data-test-contact-phone-number]') ||
      text('a[href^="tel:"]'),

    location:
      text('[data-test-row-lockup-location]')?.replace(/^·\s*/, '') || null,

    experiences,

    company: experiences[0]?.company || null,
    title: experiences[0]?.title || null,

    linkedin: window.location.href,
    recruiterUrl: window.location.href,

    savedAt: new Date().toISOString()
  };

  console.log("Candidate scraped:", candidate);
  return candidate;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SCRAPE_CANDIDATE") {
    const candidate = scrapeCandidate();

    sendResponse({
      success: true,
      candidate
    });
  }
});