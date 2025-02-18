chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTracking") {
      console.log('Received startTracking request:', request);
      chrome.scripting.executeScript({
          target: { tabId: sender.tab.id },
          function: scrollAndLoad,
          args: [request.startDate, request.endDate, request.combine]
      }, () => {
          if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
          } else {
              sendResponse({ status: "Tracking initiated" });
          }
      });
      return true; // Keep the message channel open for sendResponse
  }
});
