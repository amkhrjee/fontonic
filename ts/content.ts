let originalSerif: string, originalSansSerif: string, originalMonospace: string;

const changeFontFamily = (
  node: Node,
  serif: string,
  sansSerif: string,
  monospace: string
) => {
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as HTMLElement;
  const fontFamily = getComputedStyle(element).fontFamily;

  if (fontFamily) {
    if (fontFamily.includes("sans") && sansSerif !== "Default") {
      element.style.fontFamily = `'${sansSerif}', ${originalSansSerif}`;
    } else if (fontFamily.includes("serif") && serif !== "Default") {
      element.style.fontFamily = `'${serif}', ${originalSerif}`;
    } else if (fontFamily.includes("monospace") && monospace !== "Default") {
      element.style.fontFamily = `'${monospace}', ${originalMonospace}`;
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

  if (response.type === "apply_font") {
    const serif = response.data.serif;
    const sans_serif = response.data.sans_serif;
    const monospace = response.data.monospace;
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
        const serif = message.data.serif;
        const sans_serif = message.data.sans_serif;
        const monospace = message.data.monospace;
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
