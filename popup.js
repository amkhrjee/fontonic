// const fontSelectionForm = document.forms["main"];
// const sansSerifValue = fontSelectionForm.elements["sans-serif"].value;
// const serifValue = fontSelectionForm.elements["serif"].value;
// const monospaceValue = fontSelectionForm.elements["serif"].value;
const applyButton = document.querySelector(".apply");
const supportPage = document.querySelector(".support-slide");
const mainPage = document.querySelector(".main");
const supportButton = document.querySelector(".support>button");
const supportButtonIcon = document.querySelector(".material-symbols-outlined");
const supportButtonText = document.querySelector(".support-btn-text");
const paymentButtons = document.querySelectorAll(".support-slide>button");

let isSupportPageOpen = false;
// Show Support Page
supportButton.addEventListener("click", () => {
  if (!isSupportPageOpen) {
    supportButtonIcon.innerHTML = "arrow_back";
    supportButtonText.innerHTML = "Go Back";
    mainPage.style.opacity = "0";
    mainPage.style.visibility = "hidden";
    supportPage.style.visibility = "visible";
    supportPage.style.transform = "translateX(0)";
    isSupportPageOpen = !isSupportPageOpen;
  } else {
    supportButtonIcon.innerHTML = "favorite";
    supportButtonText.innerHTML = "Support";
    supportPage.style.transform = "translateX(18rem)";
    setTimeout(() => {
      supportPage.style.visibility = "hidden";
      mainPage.style.visibility = "visible";
      mainPage.style.opacity = "1";
    }, 200);
    isSupportPageOpen = !isSupportPageOpen;
  }
});

paymentButtons[0].addEventListener("click", () => {
  window.location.href =
    "https://paypal.me/amkhrjee?country.x=IN&locale.x=en_GB";
});

// applyButton.addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {
//       action: "applyFont",
//       sansSerif: sansSerifValue,
//       serif: serifValue,
//       monospace: monospaceValue,
//     });
//   });
// });
