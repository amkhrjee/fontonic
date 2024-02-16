// chrome.action.onClicked.addListener(async (tab) => {
//   chrome.action.setTitle({
//     title: `Inter has been applied to the current website!`,
//   });
//   const response = chrome.tabs.sendMessage(tab.id, {
//     action: "applyFont",
//   });
//   console.log(response);
//   chrome.action.setBadgeText({ text: "✔" });
//   chrome.action.setBadgeBackgroundColor({ color: "#fff" });
// });

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.action.setBadgeText({
//     text: "OFF",
//   });
// });

const extensions = "https://";
const webstore = "https://";

// chrome.action.onClicked.addListener(async (tab) => {
//   if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
//     console.log("running");
//     // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
//     const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
//     // Next state will always be the opposite
//     const nextState = prevState === "ON" ? "OFF" : "ON";

//     // Set the action badge to the next state
//     await chrome.action.setBadgeText({
//       tabId: tab.id,
//       text: nextState,
//     });
//     if (nextState === "ON") {
//       // Insert the CSS file when the user turns the extension on
//       await chrome.scripting.executeScript({
//         files: ["./content.js"],
//         target: { tabId: tab.id },
//       });
//     } else if (nextState === "OFF") {
//       // Remove the CSS file when the user turns the extension off
//       await chrome.scripting.removeCSS({
//         files: ["focus-mode.css"],
//         target: { tabId: tab.id },
//       });
//     }
//   }
// });
