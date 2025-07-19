let allowedUrls = [];

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {

    // ✅ Skip check if URL is in the allowlist
    if (allowedUrls.includes(tab.url)) {
      console.log("Allowed by user:", tab.url);
      return;
    }

    try {
      const response = await fetch("https://phishguard-api-0nyx.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tab.url })
      });

      const data = await response.json();

      if (data.prediction === 1) {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL(`warning.html?url=${encodeURIComponent(tab.url)}&confidence=${data.confidence}`)
        });
      }

    } catch (err) {
      console.error("PhishGuard background error:", err.message);
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
