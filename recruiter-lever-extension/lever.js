console.log("Recruiter → Lever Lever script loaded");

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setField(element, value) {
  if (!element || value == null) return;

  const prototype =
    element.tagName === "TEXTAREA"
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;

  const setter = Object.getOwnPropertyDescriptor(
    prototype,
    "value"
  ).set;

  setter.call(element, value);

  element.dispatchEvent(
    new Event("input", { bubbles: true })
  );

  element.dispatchEvent(
    new Event("change", { bubbles: true })
  );
}

async function setLeverLink(link) {
  if (!link) return;

  let input = document.querySelector(
    'input[placeholder="Add a link"]'
  );

  if (!input) {
    const addLink = [...document.querySelectorAll("a")]
      .find(el => el.innerText.trim() === "Add link");

    if (!addLink) {
      console.warn("Add link control not found");
      return;
    }

    addLink.click();
    await wait(300);

    input = document.querySelector(
      'input[placeholder="Add a link"]'
    );
  }

  if (!input) {
    console.warn("Link input not found");
    return;
  }

  setField(input, link);
  console.log("✓ Link:", link);
}

async function setLeverLocation(location) {
  if (!location) return;

  const editLink = [...document.querySelectorAll("a")]
    .find(el => el.innerText.trim() === "Edit");

  if (!editLink) {
    console.warn("Location Edit control not found");
    return;
  }

  editLink.click();

  let input = null;

  for (let i = 0; i < 20; i++) {
    await wait(100);

    input = document.querySelector(
      'input[placeholder="Add location"]'
    );

    if (input) break;
  }

  if (!input) {
    console.warn("Location input not found");
    return;
  }

  setField(input, location);
  input.focus();

  await wait(700);

  const firstOption = [
    ...document.querySelectorAll(
      '[role="option"], .dropdown-menu li, .dropdown-menu a'
    )
  ].find(el => {
    const rect = el.getBoundingClientRect();

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      el.innerText?.trim()
    );
  });

  if (firstOption) {
    firstOption.click();
  } else {
    console.warn("Location suggestion not found");
  }

  await wait(300);

  const saveButton = [...document.querySelectorAll("button, a")]
    .find(el => el.innerText.trim() === "Save");

  saveButton?.click();

  console.log("✓ Location:", location);
}

async function setLeverEmail(email) {
  if (!email) return;

  const addEmail = document.querySelector(
    '[data-qa="add-new-email"]'
  );

  if (!addEmail) {
    console.warn("Add email control not found");
    return;
  }

  addEmail.click();

  let input = null;

  for (let i = 0; i < 20; i++) {
    await wait(100);

    input = document.querySelector(
      '[data-qa="new-email-input"]'
    );

    if (input) break;
  }

  if (!input) {
    console.warn("Email input not found");
    return;
  }

  setField(input, email);

  const form = input.closest("form");

  if (!form) {
    console.warn("Email form not found");
    return;
  }

  form.dispatchEvent(
    new Event("submit", {
      bubbles: true,
      cancelable: true
    })
  );

  await wait(400);

  console.log("✓ Email:", email);
}

async function setLeverPhone(phone) {
  if (!phone) return;

  const addContact = [
    ...document.querySelectorAll("div.hoverable-input")
  ].find(el =>
    el.innerText?.trim() === "Add contact info"
  );

  if (!addContact) {
    console.warn("Add contact info control not found");
    return;
  }

  addContact.click();

  let input = null;

  for (let i = 0; i < 20; i++) {
    await wait(100);

    input = [...document.querySelectorAll("input")]
      .find(el =>
        el.type === "tel" ||
        el.placeholder?.toLowerCase().includes("phone") ||
        el.placeholder?.toLowerCase().includes("contact")
      );

    if (input) break;
  }

  if (!input) {
    console.warn("Phone input not found");
    return;
  }

  setField(input, phone);
  input.focus();

  for (const type of ["keydown", "keypress", "keyup"]) {
    input.dispatchEvent(
      new KeyboardEvent(type, {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true
      })
    );
  }

  await wait(400);

  console.log("✓ Phone:", phone);
}

async function fillLever(candidate) {
  console.log("Starting Lever import:", candidate);

  setField(
    document.querySelector('input[placeholder="Enter name"]'),
    candidate.name
  );

  await wait(300);

  setField(
    document.querySelector('textarea[placeholder="Organization"]'),
    candidate.company || candidate.experiences?.[0]?.company
  );

  await wait(300);

  await setLeverLink(
    candidate.linkedin || candidate.recruiterUrl
  );

  await wait(500);

  await setLeverLocation(candidate.location);

  await wait(500);

  await setLeverEmail(candidate.email);

  await wait(700);

  await setLeverPhone(candidate.phone);

  console.log("Lever import complete.");
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "FILL_LEVER") {
    fillLever(message.candidate);

    sendResponse({
      success: true
    });
  }
});