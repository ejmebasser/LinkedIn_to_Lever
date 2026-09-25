const saveButton = document.getElementById("saveCandidate");
const fillButton = document.getElementById("fillLever");
const candidateSelect = document.getElementById("candidateSelect");
const candidateInfo = document.getElementById("candidateInfo");
const status = document.getElementById("status");

async function loadCandidates() {
  const result = await chrome.storage.local.get({
    recentCandidates: []
  });

  const candidates = result.recentCandidates;

  candidateSelect.innerHTML = "";

  if (!candidates.length) {
    candidateSelect.innerHTML =
      '<option value="">No candidates saved</option>';

    candidateInfo.innerHTML = "";
    return;
  }

  candidates.forEach((candidate, index) => {
    const option = document.createElement("option");

    option.value = index;
    option.textContent = candidate.name || "Unknown Candidate";

    candidateSelect.appendChild(option);
  });

  showCandidate(candidates[0]);
}

function showCandidate(candidate) {
  if (!candidate) {
    candidateInfo.innerHTML = "";
    return;
  }

  candidateInfo.innerHTML = `
    <strong>${candidate.name || ""}</strong><br>
    ${candidate.title || ""}<br>
    ${candidate.company || ""}<br>
    ${candidate.email || ""}<br>
    ${candidate.phone || ""}
  `;
}

saveButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.tabs.sendMessage(
    tab.id,
    {
      action: "SCRAPE_CANDIDATE"
    },
    async response => {
      if (chrome.runtime.lastError) {
        status.textContent =
          "LinkedIn scraper not available on this page.";
        return;
      }

      if (!response?.success) {
        status.textContent =
          "Could not capture candidate.";
        return;
      }

      const candidate = response.candidate;

      const result = await chrome.storage.local.get({
        recentCandidates: []
      });

      const candidates = result.recentCandidates;

      const updated = [
        candidate,
        ...candidates.filter(
          c => c.recruiterUrl !== candidate.recruiterUrl
        )
      ].slice(0, 5);

      await chrome.storage.local.set({
        recentCandidates: updated
      });

      status.textContent = `Saved ${candidate.name || "candidate"}`;

      await loadCandidates();
    }
  );
});

candidateSelect.addEventListener("change", async () => {
  const index = Number(candidateSelect.value);

  const result = await chrome.storage.local.get({
    recentCandidates: []
  });

  showCandidate(result.recentCandidates[index]);
});

fillButton.addEventListener("click", async () => {
  if (candidateSelect.value === "") {
    status.textContent = "Select a candidate first.";
    return;
  }

  const index = Number(candidateSelect.value);

  const result = await chrome.storage.local.get({
    recentCandidates: []
  });

  const candidate = result.recentCandidates[index];

  if (!candidate) {
    status.textContent = "Select a candidate first.";
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.tabs.sendMessage(
    tab.id,
    {
      action: "FILL_LEVER",
      candidate
    },
    response => {
      if (chrome.runtime.lastError) {
        status.textContent =
          "Lever importer not available on this page.";
        return;
      }

      status.textContent =
        `Filling Lever with ${candidate.name || "candidate"}...`;
    }
  );
});

loadCandidates();