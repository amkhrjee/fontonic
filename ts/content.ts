type fontMetaData = {
  font: string;
  bold: boolean;
  ital: boolean;
};

const changeFontFamily = (
  node: Node,
  serif: fontMetaData,
  sansSerif: fontMetaData,
  monospace: fontMetaData
) => {
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as HTMLElement;
  const fontFamily = getComputedStyle(element).fontFamily.toLowerCase();

  const applyFontStyles = (fontMeta: fontMetaData) => {
    element.style.fontFamily = `'${fontMeta.font}'`;
    element.style.fontStyle = fontMeta.ital ? "italic" : "";
    element.style.fontWeight = fontMeta.bold ? "bold" : "";
  };

  if (fontFamily) {
    const lowerFontFamily = fontFamily.toLowerCase();
    if (
      (sansSerif.font !== "Default" && lowerFontFamily.includes("sans")) ||
      lowerFontFamily.includes("spotify")
    ) {
      applyFontStyles(sansSerif);
    } else if (
      (serif.font !== "Default" && lowerFontFamily.includes("serif")) ||
      lowerFontFamily.includes("times new roman")
    ) {
      applyFontStyles(serif);
    } else if (
      monospace.font !== "Default" &&
      lowerFontFamily.includes("mono")
    ) {
      applyFontStyles(monospace);
    }
  }

  for (let i = 0; i < element.children.length; i++) {
    changeFontFamily(element.children[i], serif, sansSerif, monospace);
  }
};

let message = {
  action: "on-page-load",
  domain: window.location.hostname,
};

// Tries to load font when page is loaded
chrome.runtime.sendMessage(message, undefined, (response) => {
  // console.log("response received:", response.type);
  // console.log(response.data);

  if (response.type === "apply_font") {
    const serif = response.data.serif as fontMetaData;
    const sans_serif = response.data.sans_serif as fontMetaData;
    const monospace = response.data.monospace as fontMetaData;

    changeFontFamily(document.body, serif, sans_serif, monospace);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          changeFontFamily(addedNode, serif, sans_serif, monospace);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

// Listens for the popup buttons
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    {
      if (message.type === "apply_font") {
        const serif = message.data.serif as fontMetaData;
        const sans_serif = message.data.sans_serif as fontMetaData;
        const monospace = message.data.monospace as fontMetaData;
        changeFontFamily(document.body, serif, sans_serif, monospace);

        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const addedNode of mutation.addedNodes) {
              changeFontFamily(addedNode, serif, sans_serif, monospace);
            }
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      } else if (message.type === "restore") {
        location.reload();
      } else if (message.type === "redirect") {
        window.open(message.data.redirect_url, "_blank");
      }
    }
  });
});
