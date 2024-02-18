chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "on-page-load") {
    /*
      Checks on page load whether the font for the domain already exists in the storage
      If it does, then gets the font and applies it to the page
    */
    chrome.storage.sync
      .get([message.domain])
      .then((result) => {
        const fontData = result[message.domain];
        if (fontData) {
          console.log("Font Found!");
          sendResponse({
            type: "apply_font",
            data: {
              serif: fontData.serif,
              sans_serif: fontData.sans_serif,
              monospace: fontData.monospace,
            },
          });
        } else {
          console.log("Font Not Found");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  // This must be returning true to keep listening
  // read more: https://stackoverflow.com/a/56483156/12404524
  return true;
});
