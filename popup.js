// Form
const fontSelectionForm = document.forms["fonts"];

// UI Elements
const applyButton = document.querySelector(".apply");
const supportPage = document.querySelector(".support-slide");
const mainPage = document.querySelector(".main");
const supportButton = document.querySelector(".support>button");
const supportButtonIcon = document.querySelector(".material-symbols-outlined");
const supportButtonText = document.querySelector(".support-btn-text");
const paymentButtons = document.querySelectorAll(".support-slide>button");

// Populating placeholder values
chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
  const domain = new URL(tabs[0].url).hostname;
  console.log("From the popup: ", domain);
  chrome.storage.sync.get([domain]).then((result) => {
    if (chrome.runtime.lastError)
      console.log("Error in getting data from Sync Storage");

    const fontData = result[domain];
    console.log(fontData);
    if (fontData) {
      fontSelectionForm.elements["serif"].placeholder = fontData.serif;
      fontSelectionForm.elements["sans-serif"].placeholder =
        fontData.sans_serif;
      fontSelectionForm.elements["monospace"].placeholder = fontData.monospace;
    }
  });
});

// Show Support Page
let isSupportPageOpen = false;
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

fontSelectionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const serifValue = fontSelectionForm.elements["serif"].value;
  const sansSerifValue = fontSelectionForm.elements["sans-serif"].value;
  const monospaceValue = fontSelectionForm.elements["monospace"].value;
  applyButton.innerHTML = "✔ Applied";
  setTimeout(() => {
    applyButton.innerHTML = "Apply Selection";
  }, 2000);

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    console.log("Popup.js -- tabs data", tabs);
    if (tabs) {
      let message = {
        type: "apply_font",
        url: tabs[0].url,
        data: {
          serif: serifValue,
          sans_serif: sansSerifValue,
          monospace: monospaceValue,
        },
      };
      chrome.tabs.sendMessage(tabs[0].id, message);

      // Saving in the Sync Storage
      const domain = new URL(tabs[0].url).hostname;
      const fontData = {
        serif: message.data.serif,
        sans_serif: message.data.sans_serif,
        monospace: message.data.monospace,
      };
      console.log("Popup.js -- Saving font data into Sync Storage...");
      chrome.storage.sync.set({ [domain]: fontData }).then(() => {
        if (chrome.runtime.lastError)
          console.log("Error in storing value to Sync Storage");
        console.log("Stored in Sync Storage!");
      });
    }
  });
});

paymentButtons[0].addEventListener("click", () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "redirect",
      data: {
        redirect_url: "https://paypal.me/amkhrjee?country.x=IN&locale.x=en_GB",
      },
    });
  });
});

paymentButtons[1].addEventListener("click", () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "redirect",
      data: {
        redirect_url: "https://www.buymeacoffee.com/amkhrjee",
      },
    });
  });
});
