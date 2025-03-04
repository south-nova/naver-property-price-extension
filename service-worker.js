chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "API_CALL") {
    fetch(request.url)
      .then((response) => response.json())
      .then((data) => sendResponse({ data }))
      .catch((error) => sendResponse({ error: error.message }));
    return true;
  }
});
