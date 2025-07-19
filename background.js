let allowedUrls = [];

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {

    // ✅ Skip check if URL is in the allowlist
    if (allowedUrls.includes(tab.url)) {
      console.log("Allowed by user:", tab.url);
      return;
    }

    try {
      console.log("Sending request to PhishGuard API for URL:", tab.url);

      const response = await fetch("https://phishguard-api-0nyx.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tab.url })
      });

      const data = await response.json();

      // ✅ Redirect only if phishing
      if (data.prediction === "Phishing") {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL(
            `warning.html?url=${encodeURIComponent(tab.url)}&confidence=${Number(data.confidence).toFixed(2)}`
          )
        });
      } else {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            alert("✅ This site is safe. Proceed with confidence!");
          }
        });
      }

      console.log("PhishGuard API response:", data);


    } catch (err) {
      console.error("PhishGuard background error:", err);
    }
  }
});

// ✅ Handle "Allow Anyway"
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "allowUrl" && message.url) {
    allowedUrls.push(message.url);
    console.log("URL added to allowlist:", message.url);
    sendResponse({ status: "ok" });
  }
});
