const logFontFamily = (node, sansSerif, serif, monospace) => {
  if (node.nodeType === 1) {
    const computedStyle = window.getComputedStyle(node);
    const fontFamily = computedStyle.getPropertyValue("font-family");

    if (fontFamily) {
      if (fontFamily.includes("sans-serif")) {
        node.style.fontFamily = `'${sansSerif}', system-ui`;
        // console.log(`${sansSerif}, system-ui`);
      } else if (fontFamily.includes("serif")) {
        node.style.fontFamily = `'${serif}', system-ui`;
      } else if (fontFamily.includes("monospace")) {
        node.style.fontFamily = `'${monospace}', Consolas, system-ui`;
      }
    }
  }

  // Recursively process child nodes
  for (const childNode of node.childNodes) {
    logFontFamily(childNode, sansSerif, serif, monospace);
  }
};

let serif, sans_serif, monospace;

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.type === "apply_font") {
    serif = req.data.serif;
    sans_serif = req.data.sans_serif;
    monospace = req.data.monospace;
    console.log("Serif: ", serif);
    console.log("Sans-Serif: ", sans_serif);
    console.log("Monospace: ", monospace);
    logFontFamily(document.body, serif, sans_serif, monospace);
  } else if (req.type === "redirect") {
    console.log("here url: ", req.data.redirect_url);
    window.open(req.data.redirect_url, "_blank");
  }
});
