chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "on-page-load") {
    /*
      Checks on page load whether the font for the domain already exists in the storage
      If it does, then gets the font and applies it to the page
    */
    // check if global apply is turned on
    chrome.storage.sync.get(["global"]).then((is_global) => {
      chrome.storage.sync.get(["override"]).then((is_override) => {
        if ("global" in is_global && is_global["global"])
          if ("override" in is_override && is_override["override"])
            // global & override both are on so apply global fonts to all sites
            chrome.storage.sync.get(["global_fonts"]).then((result) => {
              if ("global_fonts" in result) {
                //@ts-ignore
                sendResponse({
                  type: "apply_font",
                  data: result["global_fonts"],
                });
              }
            });
          else
            chrome.storage.sync.get([message.domain]).then((is_domain) => {
              if (message.domain in is_domain)
                // @ts-ignore
                sendResponse({
                  type: "apply_font",
                  data: is_domain[message.domain],
                });
                else
                // prettier-ignore
                // @ts-ignore
                sendResponse({
                  type: "apply_font",
                  data: is_domain[message.domain],
                });
            });
        else
          chrome.storage.sync.get([message.domain]).then((is_domain) => {
            if (message.domain in is_domain)
                // @ts-ignore
                sendResponse({
                  type: "apply_font",
                  data: is_domain[message.domain],
                });
              else 
                // prettier-ignore
                // @ts-ignore
              sendResponse({
                type: "none",
              });
          });
      });
    });
  }
  // This must be returning true to keep listening
  // read more: https://stackoverflow.com/a/56483156/12404524
  return true;
});
