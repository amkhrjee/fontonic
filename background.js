const updateFonts = (tab) => {
  const domain = new URL(tab.url).hostname;
  chrome.storage.sync
    .get([domain])
    .then((result) => {
      if (chrome.runtime.lastError)
        console.log("Error in getting data from Sync Storage");

      const fontData = result[domain];
      console.log("Service Worker -- Font Data", fontData);
      if (fontData) {
        // Applying the font
        let message = {
          type: "apply_font",
          data: {
            serif: fontData.serif,
            sans_serif: fontData.sans_serif,
            monospace: fontData.monospace,
          },
        };
        chrome.tabs
          .sendMessage(tab.id, message)
          .then(() => {
            console.log("Service Worker -- Message sent for applying fonts");
          })
          .catch((error) => {
            console.error(
              "SW -- Message for applying fonts could not be sent due to ",
              error
            );
          });
      }
    })
    .catch(() => {
      console.error("SW -- Could not get key from storage");
    });
};

// Appy fonts if already set for the domain
chrome.tabs.onCreated.addListener((tab) => {
  console.log("Service Worker -- Tab Created: ", tab.id);
  updateFonts(tab);
});

chrome.tabs.onUpdated.addListener((tab_id, change_info, tab) => {
  console.log("Service Worker -- Tab Updated: ", tab_id);
  updateFonts(tab);
});
