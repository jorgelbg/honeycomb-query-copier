chrome.runtime.onMessage.addListener((data) => {
  if (data.type === "notification") {
    chrome.notifications.create("", data.options);
  }
});

// chrome.notifications.create("", {
//   type: "basic",
//   title: "Primary Title",
//   message: "Primary message to display",
//   iconUrl: "icons/icon48.png",
// });

console.log("pepe");
