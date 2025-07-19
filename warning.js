window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const url = params.get("url");
  const confidence = params.get("confidence");

  const urlDisplay = document.getElementById("urlDisplay");
  const confidenceDisplay = document.getElementById("confidenceDisplay");
  const backBtn = document.getElementById("backBtn");
  const proceedBtn = document.getElementById("proceed-btn");

  if (urlDisplay) {
    urlDisplay.innerText = url;
  }

  if (confidenceDisplay && confidence) {
  confidenceDisplay.innerText = `Confidence Level: ${confidence}%`;
}


  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  proceedBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "allowUrl", url: url }, () => {
    // After allowing, redirect to original URL
    window.location.href = url;
  });
});

};
