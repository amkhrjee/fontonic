// // chrome.action.onClicked.addListener(async (tab) => {
// //   chrome.action.setTitle({
// //     title: `Inter has been applied to the current website!`,
// //   });
// //   const response = chrome.tabs.sendMessage(tab.id, {
// //     action: "applyFont",
// //   });
// //   console.log(response);
// //   chrome.action.setBadgeText({ text: "✔" });
// //   chrome.action.setBadgeBackgroundColor({ color: "#fff" });
// // });

// // chrome.runtime.onInstalled.addListener(() => {
// //   chrome.action.setBadgeText({
// //     text: "OFF",
// //   });
// // });

// const extensions = "https://";
// const webstore = "https://";

// // chrome.action.onClicked.addListener(async (tab) => {
// //   if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
// //     console.log("running");
// //     // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
// //     const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
// //     // Next state will always be the opposite
// //     const nextState = prevState === "ON" ? "OFF" : "ON";

// //     // Set the action badge to the next state
// //     await chrome.action.setBadgeText({
// //       tabId: tab.id,
// //       text: nextState,
// //     });
// //     if (nextState === "ON") {
// //       // Insert the CSS file when the user turns the extension on
// //       await chrome.scripting.executeScript({
// //         files: ["./content.js"],
// //         target: { tabId: tab.id },
// //       });
// //     } else if (nextState === "OFF") {
// //       // Remove the CSS file when the user turns the extension off
// //       await chrome.scripting.removeCSS({
// //         files: ["focus-mode.css"],
// //         target: { tabId: tab.id },
// //       });
// //     }
// //   }
// // });

// // const changeFontFamily = (node, serif, sansSerif, monospace) => {
// //   if (node.nodeType === 1) {
// //     const computedStyle = window.getComputedStyle(node);
// //     const fontFamily = computedStyle.getPropertyValue("font-family");

// //     if (fontFamily) {
// //       if (fontFamily.includes("sans-serif")) {
// //         node.style.fontFamily = `'${sansSerif}', system-ui`;
// //         // console.log(`${sansSerif}, system-ui`);
// //       } else if (fontFamily.includes("serif")) {
// //         node.style.fontFamily = `'${serif}', system-ui`;
// //       } else if (fontFamily.includes("monospace")) {
// //         node.style.fontFamily = `'${monospace}', Consolas, system-ui`;
// //       }
// //     }
// //   }

// //   // Recursively process child nodes
// //   for (const childNode of node.childNodes) {
// //     changeFontFamily(childNode, serif, sansSerif, monospace);
// //   }
// // };

// const https_url = "https://";
// const http_url = "https://";

// // chrome.runtime.onMessage.addListener(async (req, sender, res) => {
// //   if (req.type === "apply_font") {
// //     console.log("Serif: ", req.data.serif);
// //     console.log("Sans-Serif: ", req.data.sans_serif);
// //     console.log("Monospace: ", req.data.monospace);

// //     chrome.runtime.sendMessage({
// //       serif: req.data.serif,
// //       sans_serif: req.data.sans_serif,
// //       monospace: req.data.monospace,
// //     });

// //     if (
// //       req.data.tab.url.startsWith(https_url) ||
// //       req.data.tab.url.startsWith(http_url)
// //     )
// //       // Apply the fonts
// //       chrome.scripting
// //         .executeScript({
// //           target: { tabId: req.data.tab.id },
// //           files: ["./content.js"],
// //         })
// //         .then(() => {
// //           console.log("Injected Script");
// //         });
// //   }
// // });
