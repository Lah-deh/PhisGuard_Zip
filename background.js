let allowedUrls = [];

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {

    // ✅ Skip check if URL is in the allowlist
    if (allowedUrls.includes(tab.url)) {
      console.log("Allowed by user:", tab.url);
      return;
    }

    try {
      const response = await fetch("https://phishguard-api-0nyx.onrender.com/predict", {
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

// ✅ Listen for proceed messages from warning page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "allow_url" && message.url) {
    allowedUrls.push(message.url);

    // Proceed to original URL
    chrome.tabs.update(sender.tab.id, {
      url: message.url
    });
  }
});
