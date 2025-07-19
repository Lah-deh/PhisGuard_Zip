const scanBtn = document.getElementById('scanBtn');

scanBtn.addEventListener('click', () => {
  scanBtn.textContent = '🔍 Scanning...';
  scanBtn.disabled = true;
  scanBtn.style.backgroundColor = '#007bff'; // blue for scanning

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    fetch("https://phishguard-api-0nyx.onrender.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    })
    .then(response => response.json())
    .then(data => {
      const confidence = data.confidence ? `${data.confidence.toFixed(2)}%` : 'N/A';

      if (data.prediction === "Phishing") {
        alert(`⚠️ Warning: This site is flagged as phishing!\nSeverity: ${data.severity}\nConfidence: ${Math.round(data.confidence)}%`);
      } else if (data.prediction === "Legitimate") {
        alert(`✅ This site is safe.\nConfidence: ${Math.round(data.confidence)}%`);
      } else {
        alert('❓ Could not determine the site status.');
      }

    })
    .catch(error => {
      console.error("PhishGuard API error:", error);
      scanBtn.textContent = '❌ API Error';
      scanBtn.style.backgroundColor = '#6c757d'; // gray
    })
    .finally(() => {
      scanBtn.disabled = false;
    });
  });
});
