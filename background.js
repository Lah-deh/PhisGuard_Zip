let allowedUrlsPerTab = {};
let checkedUrlsPerTab = {};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url.startsWith("http") &&
    !tab.url.includes("warning.html") // don't scan the warning page itself
  ) {
    const currentUrl = tab.url;

    // Skip if user has already allowed this URL on this tab
    if (allowedUrlsPerTab[tabId] === currentUrl) return;

    // Skip if already checked this URL on this tab
    if (checkedUrlsPerTab[tabId] === currentUrl) return;

    try {
      const response = await fetch("https://phishguard-api-0nyx.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl })
      });

      const result = await response.json();
      const { prediction, severity, confidence } = result;

      // Mark as checked
      checkedUrlsPerTab[tabId] = currentUrl;

      if (prediction.toLowerCase() === "phishing" && severity.toLowerCase() !== "benign") {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL(
            `warning.html?url=${encodeURIComponent(currentUrl)}&tabId=${tabId}&severity=${severity}&confidence=${confidence.toFixed(2)}`
          )
        });
      }
    } catch (err) {
      console.error("PhishGuard error:", err);
    }
  }
});

// Handle "Allow Anyway"
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "allowUrl" && message.tabId !== undefined && message.url) {
    allowedUrlsPerTab[message.tabId] = message.url;
    checkedUrlsPerTab[message.tabId] = message.url; // prevent future checks too
    sendResponse({ status: "ok" });
  }
});

// Clear stored data when tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  delete allowedUrlsPerTab[tabId];
  delete checkedUrlsPerTab[tabId];
});

