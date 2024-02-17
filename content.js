const changeFontFamily = (node, serif, sansSerif, monospace) => {
  if (node.nodeType === 1) {
    const computedStyle = window.getComputedStyle(node);
    const fontFamily = computedStyle.getPropertyValue("font-family");

    if (fontFamily) {
      if (fontFamily.includes("sans-serif")) {
        node.style.fontFamily = `'${sansSerif}', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`;
      } else if (fontFamily.includes("serif")) {
        node.style.fontFamily = `'${serif}', 'Times New Roman', Times, serif`;
      } else if (fontFamily.includes("monospace")) {
        node.style.fontFamily = `'${monospace}', 'Cascadia Code', 'Consolas', 'Courier New', Courier, monospace`;
      }
    }
  }

  // Recursively process child nodes
  for (const childNode of node.childNodes) {
    changeFontFamily(childNode, serif, sansSerif, monospace);
  }
};

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.type === "apply_font") {
    const serif = req.data.serif;
    const sans_serif = req.data.sans_serif;
    const monospace = req.data.monospace;
    changeFontFamily(document.body, serif, sans_serif, monospace);
  } else if (req.type === "redirect") {
    console.log("here url: ", req.data.redirect_url);
    window.open(req.data.redirect_url, "_blank");
  }
});
