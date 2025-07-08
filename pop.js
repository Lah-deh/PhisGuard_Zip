const scanBtn = document.getElementById('scanBtn');

scanBtn.addEventListener('click', () => {
  scanBtn.textContent = 'Scanning...';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    fetch("https://phishguard-api-0nyx.onrender.com/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
      if (data.prediction === 1) {
        scanBtn.textContent = `⚠️ Phishing Detected! (${data.confidence}%)`;
        scanBtn.style.backgroundColor = '#dc3545'; // red
      } else if (data.prediction === 0) {
        scanBtn.textContent = `✅ Safe! (${data.confidence}%)`;
        scanBtn.style.backgroundColor = '#28a745'; // green
      } else {
        scanBtn.textContent = 'Unknown response.';
        scanBtn.style.backgroundColor = '#6c757d'; // gray
      }
    })
    .catch(error => {
      console.error("Error:", error);
      scanBtn.textContent = '❌ API Error';
      scanBtn.style.backgroundColor = '#6c757d'; // gray
    });
  });
});
