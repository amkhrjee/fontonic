// UI Elements
const applyButton = document.querySelector(".apply") as HTMLButtonElement;
const supportPage = document.querySelector(".support-slide") as HTMLDivElement;
const mainPage = document.querySelector(".main") as HTMLDivElement;
const supportButton = document.querySelector(
    ".support>button",
) as HTMLButtonElement;
const supportButtonIcon = document.querySelector(".material-symbols-outlined");
const supportButtonText = document.querySelector(
    ".support-btn-text",
) as HTMLSpanElement;
const paymentButtons = document.querySelectorAll(
    ".support-slide>button",
) as NodeListOf<HTMLButtonElement>;
const control = document.querySelector(".control") as HTMLDivElement;
const serifPlaceholder = document.querySelector(
    "#serif_placeholder",
) as HTMLOptionElement;
const sansSerifPlaceholder = document.querySelector(
    "#sans_serif_placeholder",
) as HTMLOptionElement;
const monospacePlaceholder = document.querySelector(
    "#monospace_placeholder",
) as HTMLOptionElement;
const restoreButton = document.querySelector(
    "#restore-btn",
) as HTMLButtonElement;
const fontSelectionForm = document.forms["fonts"] as HTMLFormElement;
const serifSelect = fontSelectionForm.elements["serif"] as HTMLSelectElement;
const sansSerifSelect = fontSelectionForm.elements[
    "sans_serif"
] as HTMLSelectElement;
const monospaceSelect = fontSelectionForm.elements[
    "monospace"
] as HTMLSelectElement;
const scopeSelectionForm = document.forms["scope"] as HTMLFormElement;
const scopeSelectionCheckbox = scopeSelectionForm.elements[
    "global_apply"
] as HTMLInputElement;
const overrideForm = document.forms["override_settings"] as HTMLFormElement;
const overrideCheckbox = overrideForm.elements["override"] as HTMLInputElement;

scopeSelectionCheckbox.addEventListener("change", () => {
    overrideForm.style.display = scopeSelectionCheckbox.checked
        ? "grid"
        : "none";

    // Save preference to sync storage
    chrome.storage.sync
        .set({
            global: scopeSelectionCheckbox.checked,
        })
        .then(() => {
            console.log("Global Settings applied successfully.");
        })
        .catch((err) => {
            console.error("Error in applying global value:", err);
        });

    if (scopeSelectionCheckbox.checked == false) {
        overrideCheckbox.checked = false;
        chrome.storage.sync.set({
            override: false,
        });
    }
});

overrideCheckbox.addEventListener("change", () => {
    chrome.storage.sync
        .set({
            override: overrideCheckbox.checked,
        })
        .then(() => {
            console.log("Override stored successfully.");
        })
        .catch((err) => {
            console.error("Error in applying override value:", err);
        });
});

// load locally installed fonts
const populateFonts = (element: HTMLElement) => {
    chrome.fontSettings.getFontList((fonts) => {
        fonts.forEach((font) => {
            const option = document.createElement("option");
            option.value = font.displayName;
            option.textContent = font.displayName;
            option.style.fontFamily = font.displayName;
            element.appendChild(option);
        });
    });
};

populateFonts(serifSelect);
populateFonts(sansSerifSelect);
populateFonts(monospaceSelect);

type fontData = {
    serif: string;
    sans_serif: string;
    monospace: string;
};

let tab_id: number;

const updatePlaceholders = (innerText: fontData, value: fontData) => {
    // Placeholder text content
    serifPlaceholder!.innerHTML = innerText.serif;
    sansSerifPlaceholder!.innerHTML = innerText.sans_serif;
    monospacePlaceholder!.innerHTML = innerText.monospace;

    // Placeholder value
    serifPlaceholder!.value = value.serif;
    sansSerifPlaceholder!.value = value.sans_serif;
    monospacePlaceholder!.value = value.monospace;
};

// Populating placeholder values + checkbox
chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    tab_id = tabs[0].id;
    const domain = new URL(tabs[0].url!).hostname;
    chrome.storage.sync.get([domain]).then((result) => {
        const fontData = result[domain];
        if (Object.keys(result).length != 0) {
            // Font data is there but do we have to override?
            chrome.storage.sync.get(["override"]).then((result) => {
                overrideCheckbox.checked = result["override"] ? true : false;
                if (result["override"]) {
                    chrome.storage.sync.get(["lastUsed"]).then((result) => {
                        const fontData = result["lastUsed"];
                        // console.log(fontData);
                        if (fontData) {
                            updatePlaceholders(fontData, fontData);
                            control.style.display = "flex";
                        }
                    });
                } else {
                    updatePlaceholders(fontData, fontData);
                    control.style.display = "flex";
                }
            });
        } else {
            chrome.storage.sync.get(["global"]).then((result) => {
                if (result["global"]) {
                    chrome.storage.sync.get(["lastUsed"]).then((result) => {
                        const fontData = result["lastUsed"];
                        if (fontData) {
                            updatePlaceholders(fontData, fontData);
                            control.style.display = "flex";
                        }
                    });
                }
            });
        }
    });

    chrome.storage.sync
        .get(["global"])
        .then((result) => {
            scopeSelectionCheckbox.checked = result["global"] ? true : false;
            if (result["global"]) {
                chrome.storage.sync.get(["override"]).then((result) => {
                    overrideCheckbox.checked = result["override"]
                        ? true
                        : false;
                });
            } else {
                overrideForm.style.display = "none";
            }
        })
        .catch((err) => console.error(err));
});

restoreButton.addEventListener("click", async () => {
    // Uncheck everything
    scopeSelectionCheckbox.checked = false;
    overrideCheckbox.checked = false;
    overrideForm.style.display = "none";
    chrome.storage.sync.set({
        global: false,
    });
    chrome.storage.sync.set({
        override: false,
    });
    chrome.storage.sync.remove(["lastUsed"]);
    // Restoring the original fonts
    let [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
    });
    if (tab) {
        let message = {
            type: "restore",
        };
        const port = chrome.tabs.connect(tab.id);
        port.postMessage(message);
        // Delete the font from Sync Storage
        const domain = new URL(tab.url!).hostname;
        chrome.storage.sync.remove(domain, () => {
            //console.log("Successfully removed entries for domain: ");
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
            },
        );
    }
});

// Show Support Page
let isSupportPageOpen = false;
supportButton.addEventListener("click", () => {
    if (!isSupportPageOpen) {
        supportButtonIcon!.innerHTML = "arrow_back";
        supportButtonText.innerHTML = "Go Back";
        mainPage.style.opacity = "0";
        mainPage.style.visibility = "hidden";
        supportPage.style.visibility = "visible";
        supportPage.style.transform = "translateX(0)";
        isSupportPageOpen = !isSupportPageOpen;
    } else {
        supportButtonIcon!.innerHTML = "favorite";
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
    const serifValue = serifSelect.value;
    const sansSerifValue = sansSerifSelect.value;
    const monospaceValue = monospaceSelect.value;

    if (
        !serifValue.length &&
        !sansSerifValue.length &&
        !monospaceValue.length
    ) {
        applyButton.innerHTML = "No Changes Made";
        applyButton.style.color = "#ffb6ad";
        setTimeout(() => {
            applyButton.innerHTML = "Apply Selection";
            applyButton.style.color = "#bccbaf";
        }, 1000);
    } else {
        applyButton.innerHTML = "✔ Applied";
        setTimeout(() => {
            applyButton.innerHTML = "Apply Selection";
        }, 2000);
    }
    try {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs) {
                let message = {
                    type: "apply_font",
                    data: {
                        serif: serifValue.length ? serifValue : "Default",
                        sans_serif: sansSerifValue.length
                            ? sansSerifValue
                            : "Default",
                        monospace: monospaceValue.length
                            ? monospaceValue
                            : "Default",
                    },
                };
                const port = chrome.tabs.connect(tabs[0].id);
                port.postMessage(message);

                // Saving in the Sync Storage
                const domain = new URL(tabs[0].url!).hostname;
                const fontData = {
                    serif: message.data.serif,
                    sans_serif: message.data.sans_serif,
                    monospace: message.data.monospace,
                };

                if (
                    serifValue.length ||
                    sansSerifValue.length ||
                    monospaceValue.length
                ) {
                    control.style.display = "flex";
                    chrome.storage.sync.set({ [domain]: fontData }).then(() => {
                        console.log("Stored in Sync Storage!");
                    });

                    if (scopeSelectionCheckbox.checked) {
                        chrome.storage.sync
                            .set({
                                lastUsed: fontData,
                            })
                            .then(() => console.log("Last Used Data Saved"))
                            .catch((err) =>
                                console.error("Error in LastUsed:", err),
                            );
                    }
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
});

paymentButtons[0].addEventListener("click", () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const port = chrome.tabs.connect(tabs[0].id);
        port.postMessage({
            type: "redirect",
            data: {
                redirect_url:
                    "https://paypal.me/amkhrjee?country.x=IN&locale.x=en_GB",
            },
        });
    });
});

paymentButtons[1].addEventListener("click", () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const port = chrome.tabs.connect(tabs[0].id);
        port.postMessage({
            type: "redirect",
            data: {
                redirect_url: "https://www.buymeacoffee.com/amkhrjee",
            },
        });
    });
});

paymentButtons[2].addEventListener("click", () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const port = chrome.tabs.connect(tabs[0].id);
        port.postMessage({
            type: "redirect",
            data: {
                redirect_url: "https://github.com/amkhrjee/fontonic",
            },
        });
    });
});

paymentButtons[3].addEventListener("click", () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const port = chrome.tabs.connect(tabs[0].id);
        port.postMessage({
            type: "redirect",
            data: {
                redirect_url: "https://linktr.ee/amkhrjee",
            },
        });
    });
});
