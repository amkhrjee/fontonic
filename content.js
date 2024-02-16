// chrome.runtime.onMessage.addListener((req, sender, res) => {
//   console.log(
//     sender.tab
//       ? "from a content script:" + sender.tab.url
//       : "from the extension"
//   );
//   res("Message received!");
//   if (req.action === "applyFont") {
//   }
// });

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

logFontFamily(
  document.body,
  "Comic Sans MS",
  "Comic Sans MS",
  "Code New Roman"
);
