let originalSerif: string, originalSansSerif: string, originalMonospace: string;
// let invokeCount = 0;

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
  // console.log("Function Invokation Count:", invokeCount++);

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as HTMLElement;
  const fontFamily = getComputedStyle(element).fontFamily.toLowerCase();

  if (fontFamily) {
    if (
      fontFamily.includes("sans") ||
      (fontFamily.includes("spotify") && sansSerif.font !== "Default")
    ) {
      element.style.fontFamily = `'${sansSerif.font}', ${originalSansSerif}`;
      if (sansSerif.ital) {
        element.style.fontStyle = "italic";
      }
      if (sansSerif.bold) {
        element.style.fontWeight = "bold";
      }
    } else if (
      fontFamily.includes("serif") ||
      (fontFamily.includes("times new roman") && serif.font !== "Default")
    ) {
      element.style.fontFamily = `'${serif.font}', ${originalSerif}`;
      if (serif.ital) {
        element.style.fontStyle = "italic";
      }
      if (serif.bold) {
        element.style.fontWeight = "bold";
      }
    } else if (fontFamily.includes("mono") && monospace.font !== "Default") {
      element.style.fontFamily = `'${monospace.font}', ${originalMonospace}`;
      if (monospace.ital) {
        element.style.fontStyle = "italic";
      }
      if (monospace.bold) {
        element.style.fontWeight = "bold";
      }
    }
  }

  const childNodes = element.children;
  for (let i = 0; i < childNodes.length; i++) {
    changeFontFamily(childNodes[i], serif, sansSerif, monospace);
  }
};

let message = {
  action: "on-page-load",
  domain: window.location.hostname,
};

// Tries to load font when page is loaded
chrome.runtime.sendMessage(message, undefined, (response) => {
  console.log("response received:", response.type);
  console.log(response.data);

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
