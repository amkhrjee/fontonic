let originalSerif: string, originalSansSerif: string, originalMonospace: string;

const changeFontFamily = (
  node: Node,
  serif: string,
  sansSerif: string,
  monospace: string,
  doRestore: boolean
) => {
  if (node.nodeType === 1) {
    const computedStyle = window.getComputedStyle(node as Element);
    const fontFamily = computedStyle.getPropertyValue("font-family");

    if (fontFamily) {
      if (fontFamily.includes("sans-serif")) {
        if (!doRestore || sansSerif != "Default") {
          originalSansSerif = fontFamily;
          (node as HTMLElement).style.fontFamily =
            `'${sansSerif}', ${originalSansSerif}`;
        } else {
          (node as HTMLElement).style.fontFamily = `${originalSansSerif}`;
        }
      } else if (fontFamily.includes("serif")) {
        if (!doRestore || serif != "Default") {
          originalSerif = fontFamily;
          (node as HTMLElement).style.fontFamily =
            `'${serif}', ${originalSerif}`;
        } else {
          (node as HTMLElement).style.fontFamily = `${originalSerif}`;
        }
      } else if (fontFamily.includes("monospace")) {
        if (!doRestore || monospace != "Default") {
          originalMonospace = fontFamily;
          (node as HTMLElement).style.fontFamily =
            `'${monospace}', ${originalMonospace}`;
        } else {
          (node as HTMLElement).style.fontFamily = `${originalMonospace}`;
        }
      }
    }
  }

  // Recursively process child nodes
  for (const childNode of node.childNodes) {
    changeFontFamily(childNode, serif, sansSerif, monospace, doRestore);
  }
};

chrome.runtime.onMessage.addListener((req, _sender, _res) => {
  if (req.type === "apply_font") {
    const serif = req.data.serif;
    const sans_serif = req.data.sans_serif;
    const monospace = req.data.monospace;
    changeFontFamily(document.body, serif, sans_serif, monospace, false);
  } else if (req.type === "redirect") {
    console.log("here url: ", req.data.redirect_url);
    window.open(req.data.redirect_url, "_blank");
  } else if (req.type === "restore") {
    console.log("Message received for restoring fonts...");
    changeFontFamily(document.body, "", "", "", true);
  }
  return true;
});
