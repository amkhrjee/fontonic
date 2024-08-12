chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "on-page-load") {
    /*
      Checks on page load whether the font for the domain already exists in the storage
      If it does, then gets the font and applies it to the page
    */
    chrome.storage.sync.get([message.domain]).then((result) => {
      const fontData = result[message.domain];

      if (Object.keys(result).length) {
        //@ts-ignore
        sendResponse({
          type: "apply_font",
          data: fontData,
        });
      } else {
        // @ts-ignore
        sendResponse({
          type: "none",
        });
      }
    });
  }
  return true;
});
