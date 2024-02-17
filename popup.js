const fontSelectionForm = document.forms["fonts"];
// Experiment
const serifSelect = fontSelectionForm.elements["serif"];
const sansSerifSelect = fontSelectionForm.elements["sans_serif"];
const monospaceSelect = fontSelectionForm.elements["monospace"];
// load locally installed fonts
const populateFonts = (element) => {
  chrome.fontSettings.getFontList((fonts) => {
    fonts.forEach((font) => {
      const option = document.createElement("option");
      option.value = font.displayName;
      option.textContent = font.displayName;
      element.appendChild(option);
    });
  });
};

populateFonts(serifSelect);
populateFonts(sansSerifSelect);
populateFonts(monospaceSelect);

// UI Elements
const applyButton = document.querySelector(".apply");
const supportPage = document.querySelector(".support-slide");
const mainPage = document.querySelector(".main");
const supportButton = document.querySelector(".support>button");
const supportButtonIcon = document.querySelector(".material-symbols-outlined");
const supportButtonText = document.querySelector(".support-btn-text");
const paymentButtons = document.querySelectorAll(".support-slide>button");
const pauseButton = document.querySelector("#pause-btn");
const control = document.querySelector(".control");
const serifPlaceholder = document.querySelector("#serif_placeholder");
const sansSerifPlaceholder = document.querySelector("#sans_serif_placeholder");
const monospacePlaceholder = document.querySelector("#monospace_placeholder");
const restoreButton = document.querySelector("#restore-btn");

const updatePlaceholders = (innerText, value) => {
  // Placeholder text content
  serifPlaceholder.innerHTML = innerText.serif;
  sansSerifPlaceholder.innerHTML = innerText.sans_serif;
  monospacePlaceholder.innerHTML = innerText.monospace;

  // Placeholder value
  serifPlaceholder.value = value.serif;
  sansSerifPlaceholder.value = value.sans_serif;
  monospacePlaceholder.value = value.monospace;
};

restoreButton.addEventListener("click", async () => {
  // Restoring the original fonts
  let [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (tab) {
    let message = {
      type: "restore",
    };
    chrome.tabs.sendMessage(tab.id, message);
  }
  // Delete the font from Sync Storage
  const domain = new URL(tab.url).hostname;
  chrome.storage.sync.remove(domain, () => {
    console.log("Successfully removed entries for domain: ");
  });
  // Hide the Pause and Restore Buttons
  control.style.display = "none";
  // Revert the placeholders to default
  updatePlaceholders(
    {
      serif: "Default",
      sans_serif: "Default",
      monospace: "Default",
    },
    {
      serif: "",
      sans_serif: "",
      monospace: "",
    }
  );
});
// Pause Button
let isPaused = false;
pauseButton.addEventListener("click", () => {
  if (!isPaused) {
    document.querySelector("#pause-btn>.material-symbols-outlined").innerHTML =
      "play_arrow";
    document.querySelector("#pause-btn>.btn-text").innerHTML = "Resume";
  } else {
    document.querySelector("#pause-btn>.material-symbols-outlined").innerHTML =
      "pause";
    document.querySelector("#pause-btn>.btn-text").innerHTML = "Pause";
  }
  isPaused = !isPaused;
});

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
      updatePlaceholders(fontData, fontData);
      control.style.display = "flex";
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
    supportButtonText.innerHTML = "Sponsor";
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
  const serifValue = serifSelect.value;
  const sansSerifValue = sansSerifSelect.value;
  const monospaceValue = sansSerifSelect.value;
  control.style.display = "flex";
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
