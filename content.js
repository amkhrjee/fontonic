let originalSerif, originalSansSerif, originalMonospace;

const changeFontFamily = (node, serif, sansSerif, monospace, doRestore) => {
  if (node.nodeType === 1) {
    const computedStyle = window.getComputedStyle(node);
    const fontFamily = computedStyle.getPropertyValue("font-family");

    if (fontFamily) {
      if (fontFamily.includes("sans-serif")) {
        if (!doRestore) {
          originalSansSerif = fontFamily;
          node.style.fontFamily = `'${sansSerif}', ${originalSansSerif}`;
        } else {
          node.style.fontFamily = `${originalSansSerif}`;
        }
      } else if (fontFamily.includes("serif")) {
        if (!doRestore) {
          originalSerif = fontFamily;
          node.style.fontFamily = `'${serif}', ${originalSerif}`;
        } else {
          node.style.fontFamily = `${originalSerif}`;
        }
      } else if (fontFamily.includes("monospace")) {
        if (!doRestore) {
          originalMonospace = fontFamily;
          node.style.fontFamily = `'${monospace}', ${originalMonospace}`;
        } else {
          node.style.fontFamily = `${originalMonospace}`;
        }
      }
    }
  }

  // Recursively process child nodes
  for (const childNode of node.childNodes) {
    changeFontFamily(childNode, serif, sansSerif, monospace, doRestore);
  }
};

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.type === "apply_font") {
    const serif = req.data.serif;
    const sans_serif = req.data.sans_serif;
    const monospace = req.data.monospace;
    changeFontFamily(document.body, serif, sans_serif, monospace, false);
  } else if (req.type === "redirect") {
    console.log("here url: ", req.data.redirect_url);
    window.open(req.data.redirect_url, "_blank");
  } else if (req.type === "restore") {
    changeFontFamily(document.body, "", "", "", true);
  }
});
