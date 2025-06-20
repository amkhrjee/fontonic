type fontData = {
    serif: {
        font: string;
        bold: boolean;
        ital: boolean;
        color: string;
        // sizeMultiplier?: string; // Optional, default to "1"
    };
    sans_serif: {
        font: string;
        bold: boolean;
        ital: boolean;
        color: string;
        // sizeMultiplier?: string; // Optional, default to "1"
    };
    monospace: {
        font: string;
        bold: boolean;
        ital: boolean;
        color: string;
        // sizeMultiplier?: string; // Optional, default to "1"
    };
};

function getSizeMultiplier(value?: string): string {
    return value && value !== "" ? value : "1";
}

type Placeholder = {
    serif: string;
    sans_serif: string;
    monospace: string;
};

const settingsButton = document.getElementById("settings-btn");
const supportButton = document.getElementById("support-btn");
const homePage = document.getElementById("home-page");
const settingsPage = document.getElementById("settings-page");
const wrapper = document.getElementById("wrapper");
const supportPage = document.getElementById("support-page");
const restoreButton = document.getElementById("restore-btn");
const formButtons = document.getElementById("form-btns");
const applyButton = document.getElementById("apply-btn");
// Check buttons
const globalCheck = document.getElementById("global_check") as HTMLInputElement;
const overrideCheck = document.getElementById(
    "override_check",
) as HTMLInputElement;
const exemptCheck = document.getElementById("exempt_check") as HTMLInputElement;
const tipText = document.getElementById("tip");
const tipWhenOverrideOn = document.getElementById("tip-override-on");
const tipWhenOverrideOff = document.getElementById("tip-override-off");
const tipWhenSiteIsExempted = document.getElementById("tip-exempt");
const tipBox = document.getElementById("tip-box");
const globalNotSelectedInfoText = document.getElementById(
    "global_not_checked_info_text",
);
const globalFontsSelection = document.getElementById("global_fonts_selection");

const globalFontSelectionForm = document.forms[
    "global_fonts"
] as HTMLFormElement;
const globalSerifSelect = globalFontSelectionForm.elements[
    "global_serif"
] as HTMLSelectElement;
const globalSansSerifSelect = globalFontSelectionForm.elements[
    "global_sans_serif"
] as HTMLSelectElement;
const globalMonospaceSelect = globalFontSelectionForm.elements[
    "global_monospace"
] as HTMLSelectElement;
const globalSerifPlaceholder = document.querySelector(
    "#global_serif_placeholder",
) as HTMLOptionElement;
const globalSansSerifPlaceholder = document.querySelector(
    "#global_sans_serif_placeholder",
) as HTMLOptionElement;
const globalMonospacePlaceholder = document.querySelector(
    "#global_monospace_placeholder",
) as HTMLOptionElement;

// Global versions
const globalSerifBoldBtn = document.querySelector(
    "#global_serif_bold",
) as HTMLElement;
const globalSerifItalBtn = document.querySelector(
    "#global_serif_ital",
) as HTMLElement;
const globalSerifLabel = document.querySelector(
    "#global_serif_label",
) as HTMLElement;

const globalSansBoldBtn = document.querySelector(
    "#global_sans_bold",
) as HTMLElement;
const globalSansItalBtn = document.querySelector(
    "#global_sans_ital",
) as HTMLElement;
const globalSansLabel = document.querySelector(
    "#global_sans_label",
) as HTMLElement;

const globalMonoBoldBtn = document.querySelector(
    "#global_mono_bold",
) as HTMLElement;
const globalMonoItalBtn = document.querySelector(
    "#global_mono_ital",
) as HTMLElement;
const globalMonoLabel = document.querySelector(
    "#global_mono_label",
) as HTMLElement;

// Color buttons
const serifColor = document.getElementById("serif_color") as HTMLInputElement;
const sansColor = document.getElementById("sans_color") as HTMLInputElement;
const monoColor = document.getElementById("mono_color") as HTMLInputElement;

const globalSerifColor = document.getElementById(
    "global_serif_color",
) as HTMLInputElement;
const globalSansColor = document.getElementById(
    "global_sans_color",
) as HTMLInputElement;
const globalMonoColor = document.getElementById(
    "global_mono_color",
) as HTMLInputElement;

// size multipliers

// const serifSizeMult = document.getElementById("serif_size") as HTMLInputElement;
// const sansSizeMult = document.getElementById("sans_size") as HTMLInputElement;
// const monoSizeMult = document.getElementById("mono_size") as HTMLInputElement;

const globalSerifSizeMult = document.getElementById(
    "global_serif_size",
) as HTMLInputElement;
const globalSansSizeMult = document.getElementById(
    "global_sans_size",
) as HTMLInputElement;
const globalMonoSizeMult = document.getElementById(
    "global_mono_size",
) as HTMLInputElement;

tipWhenOverrideOn.remove();
tipWhenOverrideOff.remove();
tipWhenSiteIsExempted.remove();

const showTip = (tip: HTMLElement) => {
    tipBox.removeChild(tipBox.children[0]);
    tipBox.appendChild(tip);
    return true;
};

const getDomain = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query(
            {
                active: true,
                lastFocusedWindow: true,
            },
            (tabs) => {
                if (tabs[0] && tabs[0].url)
                    resolve(new URL(tabs[0].url).hostname);
                else reject(new Error("Could not return tab url"));
            },
        );
    });
};

// by default these extra pages are unmounted
settingsPage.remove();
supportPage.remove();
restoreButton.remove();

const goToSettings = () => {
    settingsButton.click();
};

// Check for configuration settings
chrome.storage.sync.get(["global"]).then(async (result) => {
    globalCheck.checked = "global" in result && result["global"];

    if (globalCheck.checked) {
        overrideCheck.disabled = false;
        exemptCheck.disabled = false;
        globalNotSelectedInfoText.remove();
        const globalFonts = await chrome.storage.sync.get(["global_fonts"]);
        if ("global_fonts" in globalFonts) {
            const global_fonts = globalFonts["global_fonts"] as fontData;
            // Placeholder text content
            globalSerifPlaceholder.innerHTML = global_fonts.serif.font;
            globalSansSerifPlaceholder.innerHTML = global_fonts.sans_serif.font;
            globalMonospacePlaceholder.innerHTML = global_fonts.monospace.font;

            // Placeholder value
            globalSerifPlaceholder.value =
                global_fonts.serif.font === "Default"
                    ? ""
                    : global_fonts.serif.font;
            globalSansSerifPlaceholder.value =
                global_fonts.sans_serif.font === "Default"
                    ? ""
                    : global_fonts.sans_serif.font;
            globalMonospacePlaceholder.value =
                global_fonts.monospace.font === "Default"
                    ? ""
                    : global_fonts.monospace.font;
        }

        chrome.storage.sync.get(["override"]).then((result) => {
            const willOverride = "override" in result && result["override"];
            overrideCheck.checked = willOverride;
            showTip(willOverride ? tipWhenOverrideOn : tipWhenOverrideOff);
        });

        chrome.storage.sync
            .get(["exempts"])
            .then(async (result: { exempts: string[] }) => {
                exemptCheck.checked =
                    "exempts" in result &&
                    result["exempts"].includes(await getDomain()) &&
                    showTip(tipWhenSiteIsExempted);
            });
    } else {
        globalFontsSelection.remove();
    }
});

settingsButton.addEventListener("click", async () => {
    if (settingsButton.textContent.charAt(0) === "S") {
        settingsButton.textContent = "Go back";
        if (supportButton.textContent.includes("<")) supportPage.remove();
        else homePage.remove();
        supportButton.textContent = "🖤 Wanna help?";
        wrapper.appendChild(settingsPage);

        // Check for exisitng settings
        globalCheck.addEventListener("change", async () => {
            // enable/disable the other checkboxes
            overrideCheck.disabled = !globalCheck.checked;
            exemptCheck.disabled = !globalCheck.checked;

            // Save this setting to sync storage
            await chrome.storage.sync.set({
                global: globalCheck.checked,
            });

            if (globalCheck.checked) {
                showTip(
                    overrideCheck.checked
                        ? tipWhenOverrideOn
                        : tipWhenOverrideOff,
                );
                exemptCheck.checked && showTip(tipWhenSiteIsExempted);
                globalNotSelectedInfoText.remove();
                settingsPage.appendChild(globalFontsSelection);

                // check if fonts are set for the site
                const domain = await getDomain();
                const setFonts = await chrome.storage.sync.get([domain]);
                if (domain in setFonts) {
                    await chrome.storage.sync.set({
                        global_fonts: setFonts[domain],
                    });
                }
                const globalFonts = await chrome.storage.sync.get([
                    "global_fonts",
                ]);
                if ("global_fonts" in globalFonts) {
                    const global_fonts = globalFonts[
                        "global_fonts"
                    ] as fontData;
                    // Placeholder text content
                    globalSerifPlaceholder.innerHTML = global_fonts.serif.font;
                    globalSansSerifPlaceholder.innerHTML =
                        global_fonts.sans_serif.font;
                    globalMonospacePlaceholder.innerHTML =
                        global_fonts.monospace.font;

                    // Placeholder value
                    globalSerifPlaceholder.value =
                        global_fonts.serif.font === "Default"
                            ? ""
                            : global_fonts.serif.font;
                    globalSansSerifPlaceholder.value =
                        global_fonts.sans_serif.font === "Default"
                            ? ""
                            : global_fonts.sans_serif.font;
                    globalMonospacePlaceholder.value =
                        global_fonts.monospace.font === "Default"
                            ? ""
                            : global_fonts.monospace.font;

                    // Bold and Ital
                    isGlobalSerifBoldBtnOn = global_fonts.serif.bold;
                    if (isGlobalSerifBoldBtnOn) {
                        btnSelect(globalSerifBoldBtn);
                    }
                    isGlobalSerifItalBtnOn = global_fonts.serif.ital;
                    if (isGlobalSerifItalBtnOn) {
                        btnSelect(globalSerifItalBtn);
                    }
                    isGlobalSansBoldBtnOn = global_fonts.sans_serif.bold;
                    if (isGlobalSansBoldBtnOn) {
                        btnSelect(globalSansBoldBtn);
                    }
                    isGlobalSansItalBtnOn = global_fonts.sans_serif.ital;
                    if (isGlobalSansItalBtnOn) {
                        btnSelect(globalSansItalBtn);
                    }
                    isGlobalMonoBoldBtnOn = global_fonts.monospace.bold;
                    if (isGlobalMonoBoldBtnOn) {
                        btnSelect(globalMonoBoldBtn);
                    }
                    isGlobalMonoItalBtnOn = global_fonts.monospace.ital;
                    if (isGlobalMonoItalBtnOn) {
                        btnSelect(globalMonoItalBtn);
                    }

                    // updating the colors
                    globalSerifColor.value = global_fonts.serif.color;
                    globalSansColor.value = global_fonts.sans_serif.color;
                    globalMonoColor.value = global_fonts.monospace.color;

                    // updating the sizes
                    // globalSerifSizeMult.value =
                    //     global_fonts.serif.sizeMultiplier ?? "1";
                    // globalSansSizeMult.value =
                    //     global_fonts.sans_serif.sizeMultiplier ?? "1";
                    // globalMonoSizeMult.value =
                    //     global_fonts.monospace.sizeMultiplier ?? "1";
                }
            } else {
                showTip(tipText);
                globalFontsSelection.remove();
                settingsPage.appendChild(globalNotSelectedInfoText);
            }
        });

        overrideCheck.addEventListener("change", async () => {
            await chrome.storage.sync.set({
                override: overrideCheck.checked,
            });
            showTip(
                overrideCheck.checked ? tipWhenOverrideOn : tipWhenOverrideOff,
            );
        });

        exemptCheck.addEventListener("change", async () => {
            // Get the list of all exempted websites
            let exempted_domains = [];
            const result = await chrome.storage.sync.get(["exempts"]);
            if ("exempts" in result) exempted_domains = result["exempts"];
            const domain = await getDomain();
            if (exemptCheck.checked && showTip(tipWhenSiteIsExempted))
                exempted_domains.push(domain);
            else {
                exempted_domains = exempted_domains.filter(
                    (el) => el !== domain,
                );
                showTip(
                    overrideCheck.checked
                        ? tipWhenOverrideOn
                        : tipWhenOverrideOff,
                );
            }
            await chrome.storage.sync.set({
                exempts: exempted_domains,
            });
        });
    } else {
        settingsButton.textContent = "Settings";
        settingsPage.remove();
        wrapper.appendChild(homePage);
    }
});

supportButton.addEventListener("click", () => {
    if (supportButton.textContent.includes("🖤")) {
        supportButton.textContent = "<- Go back";
        if (settingsButton.textContent.includes("G")) settingsPage.remove();
        else homePage.remove();
        settingsButton.textContent = "Settings";
        wrapper.appendChild(supportPage);
    } else {
        supportButton.textContent = "🖤 Wanna help?";
        supportPage.remove();
        wrapper.appendChild(homePage);
    }
});

// For global

// For Domain specific
const fontSelectionForm = document.forms["fonts"] as HTMLFormElement;
const serifSelect = fontSelectionForm.elements["serif"] as HTMLSelectElement;
const sansSerifSelect = fontSelectionForm.elements[
    "sans_serif"
] as HTMLSelectElement;
const monospaceSelect = fontSelectionForm.elements[
    "monospace"
] as HTMLSelectElement;
const serifPlaceholder = document.querySelector(
    "#serif_placeholder",
) as HTMLOptionElement;
const sansSerifPlaceholder = document.querySelector(
    "#sans_serif_placeholder",
) as HTMLOptionElement;
const monospacePlaceholder = document.querySelector(
    "#monospace_placeholder",
) as HTMLOptionElement;

// Populating placeholder values + checkbox
const updatePlaceholders = (innerText: Placeholder) => {
    // Placeholder text content
    serifPlaceholder!.innerHTML = innerText.serif;
    sansSerifPlaceholder!.innerHTML = innerText.sans_serif;
    monospacePlaceholder!.innerHTML = innerText.monospace;

    // Placeholder value
    serifPlaceholder!.value =
        innerText.serif === "Default" ? "" : innerText.serif;
    sansSerifPlaceholder!.value =
        innerText.sans_serif === "Default" ? "" : innerText.sans_serif;
    monospacePlaceholder!.value =
        innerText.monospace === "Default" ? "" : innerText.monospace;
};

// Bold and Italicizing
const btnSelect = (node: HTMLElement) => {
    // node.style.backgroundColor = "oklch(var(--s))";
    // node.style.color = "oklch(var(--sc))";
    node.classList.replace("btn-ghost", "btn-secondary");
};

const btnDeselect = (node: HTMLElement) => {
    // node.style.backgroundColor = "oklch(var(--n))";
    // node.style.color = "oklch(var(--nc))";
    node.classList.replace("btn-secondary", "btn-ghost");
};

const serifBoldBtn = document.getElementById("serif_bold");
const serifItalBtn = document.getElementById("serif_ital");
const serifLabel = document.getElementById("serif_label");

const sansBoldBtn = document.getElementById("sans_bold");
const sansItalBtn = document.getElementById("sans_ital");
const sansLabel = document.getElementById("sans_label");

const monoBoldBtn = document.getElementById("mono_bold");
const monoItalBtn = document.getElementById("mono_ital");
const monoLabel = document.getElementById("mono_label");

let isSerifBoldBtnOn = false;
let isSerifItalBtnOn = false;

let isSansBoldBtnOn = false;
let isSansItalBtnOn = false;

let isMonoBoldBtnOn = false;
let isMonoItalBtnOn = false;

// Update the Buttons when popup loaded for a site
getDomain().then((domain) => {
    chrome.storage.sync.get([domain]).then((result) => {
        if (Object.keys(result).length != 0) {
            const fontData = result[domain] as fontData;
            console.log("hello there");

            console.log(fontData);

            updatePlaceholders({
                serif: fontData.serif.font,
                sans_serif: fontData.sans_serif.font,
                monospace: fontData.monospace.font,
            });
            formButtons.prepend(restoreButton);
            isSerifBoldBtnOn = fontData.serif.bold;

            if (isSerifBoldBtnOn) {
                btnSelect(serifBoldBtn);
            }
            isSerifItalBtnOn = fontData.serif.ital;
            if (isSerifItalBtnOn) {
                btnSelect(serifItalBtn);
            }
            isSansBoldBtnOn = fontData.sans_serif.bold;
            if (isSansBoldBtnOn) {
                btnSelect(sansBoldBtn);
            }
            isSansItalBtnOn = fontData.sans_serif.ital;
            if (isSansItalBtnOn) {
                btnSelect(sansItalBtn);
            }
            isMonoBoldBtnOn = fontData.monospace.bold;
            if (isMonoBoldBtnOn) {
                btnSelect(monoBoldBtn);
            }
            isMonoItalBtnOn = fontData.monospace.ital;
            if (isMonoItalBtnOn) {
                btnSelect(monoItalBtn);
            }

            // updating the colors
            serifColor.value = fontData.serif.color;
            sansColor.value = fontData.sans_serif.color;
            monoColor.value = fontData.monospace.color;

            // updating the sizes
            // serifSizeMult.value = fontData.serif.sizeMultiplier ?? "1";
            // sansSizeMult.value = fontData.sans_serif.sizeMultiplier ?? "1";
            // monoSizeMult.value = fontData.monospace.sizeMultiplier ?? "1";
        }
    });
});

serifBoldBtn.addEventListener("click", async () => {
    if (isSerifBoldBtnOn) btnDeselect(serifBoldBtn);
    else btnSelect(serifBoldBtn);
    isSerifBoldBtnOn = !isSerifBoldBtnOn;
});

serifItalBtn.addEventListener("click", async () => {
    if (isSerifItalBtnOn) btnDeselect(serifItalBtn);
    else btnSelect(serifItalBtn);
    isSerifItalBtnOn = !isSerifItalBtnOn;
});

sansBoldBtn.addEventListener("click", async () => {
    if (isSansBoldBtnOn) btnDeselect(sansBoldBtn);
    else btnSelect(sansBoldBtn);
    isSansBoldBtnOn = !isSansBoldBtnOn;
});

sansItalBtn.addEventListener("click", async () => {
    if (isSansItalBtnOn) btnDeselect(sansItalBtn);
    else btnSelect(sansItalBtn);
    isSansItalBtnOn = !isSansItalBtnOn;
});

monoBoldBtn.addEventListener("click", async () => {
    if (isMonoBoldBtnOn) btnDeselect(monoBoldBtn);
    else btnSelect(monoBoldBtn);
    isMonoBoldBtnOn = !isMonoBoldBtnOn;
});

monoItalBtn.addEventListener("click", async () => {
    if (isMonoItalBtnOn) btnDeselect(monoItalBtn);
    else btnSelect(monoItalBtn);
    isMonoItalBtnOn = !isMonoItalBtnOn;
});

let isGlobalSerifBoldBtnOn = false;
let isGlobalSerifItalBtnOn = false;

let isGlobalSansBoldBtnOn = false;
let isGlobalSansItalBtnOn = false;

let isGlobalMonoBoldBtnOn = false;
let isGlobalMonoItalBtnOn = false;

chrome.storage.sync.get(["global_fonts"]).then((result) => {
    if (Object.keys(result).length != 0) {
        const fontData = result["global_fonts"] as fontData;

        isGlobalSerifBoldBtnOn = fontData.serif.bold;

        if (isGlobalSerifBoldBtnOn) {
            btnSelect(globalSerifBoldBtn);
        }
        isGlobalSerifItalBtnOn = fontData.serif.ital;
        if (isGlobalSerifItalBtnOn) {
            btnSelect(globalSerifItalBtn);
        }
        isGlobalSansBoldBtnOn = fontData.sans_serif.bold;
        if (isGlobalSansBoldBtnOn) {
            btnSelect(globalSansBoldBtn);
        }
        isGlobalSansItalBtnOn = fontData.sans_serif.ital;
        if (isGlobalSansItalBtnOn) {
            btnSelect(globalSansItalBtn);
        }
        isGlobalMonoBoldBtnOn = fontData.monospace.bold;
        if (isGlobalMonoBoldBtnOn) {
            btnSelect(globalMonoBoldBtn);
        }
        isGlobalMonoItalBtnOn = fontData.monospace.ital;
        if (isGlobalMonoItalBtnOn) {
            btnSelect(globalMonoItalBtn);
        }

        // updating the colors
        globalSerifColor.value = fontData.serif.color;
        globalSansColor.value = fontData.sans_serif.color;
        globalMonoColor.value = fontData.monospace.color;
    }
});

globalSerifBoldBtn.addEventListener("click", async () => {
    if (isGlobalSerifBoldBtnOn) btnDeselect(globalSerifBoldBtn);
    else btnSelect(globalSerifBoldBtn);
    isGlobalSerifBoldBtnOn = !isGlobalSerifBoldBtnOn;
});

globalSerifItalBtn.addEventListener("click", async () => {
    if (isGlobalSerifItalBtnOn) btnDeselect(globalSerifItalBtn);
    else btnSelect(globalSerifItalBtn);
    isGlobalSerifItalBtnOn = !isGlobalSerifItalBtnOn;
});

globalSansBoldBtn.addEventListener("click", async () => {
    if (isGlobalSansBoldBtnOn) btnDeselect(globalSansBoldBtn);
    else btnSelect(globalSansBoldBtn);
    isGlobalSansBoldBtnOn = !isGlobalSansBoldBtnOn;
});

globalSansItalBtn.addEventListener("click", async () => {
    if (isGlobalSansItalBtnOn) btnDeselect(globalSansItalBtn);
    else btnSelect(globalSansItalBtn);
    isGlobalSansItalBtnOn = !isGlobalSansItalBtnOn;
});

globalMonoBoldBtn.addEventListener("click", async () => {
    if (isGlobalMonoBoldBtnOn) btnDeselect(globalMonoBoldBtn);
    else btnSelect(globalMonoBoldBtn);
    isGlobalMonoBoldBtnOn = !isGlobalMonoBoldBtnOn;
});

globalMonoItalBtn.addEventListener("click", async () => {
    if (isGlobalMonoItalBtnOn) btnDeselect(globalMonoItalBtn);
    else btnSelect(globalMonoItalBtn);
    isGlobalMonoItalBtnOn = !isGlobalMonoItalBtnOn;
});

// load locally installed fonts
for (const each_type of [serifSelect, sansSerifSelect, monospaceSelect]) {
    chrome.fontSettings.getFontList((fonts) => {
        fonts.forEach((font) => {
            const option = document.createElement("option");
            option.value = font.displayName;
            option.textContent = font.displayName;
            option.style.fontFamily = font.displayName;
            each_type.appendChild(option);
        });
    });
}

// for global fonts form
for (const each_type of [
    globalSerifSelect,
    globalSansSerifSelect,
    globalMonospaceSelect,
]) {
    chrome.fontSettings.getFontList((fonts) => {
        fonts.forEach((font) => {
            const option = document.createElement("option");
            option.value = font.displayName;
            option.textContent = font.displayName;
            option.style.fontFamily = font.displayName;
            each_type.appendChild(option);
        });
    });
}

fontSelectionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const serifValue = serifSelect.value;
    const sansSerifValue = sansSerifSelect.value;
    const monospaceValue = monospaceSelect.value;
    if (
        !serifValue.length &&
        !sansSerifValue.length &&
        !monospaceValue.length &&
        !isSansBoldBtnOn &&
        !isSansItalBtnOn &&
        !isSerifBoldBtnOn &&
        !isSerifItalBtnOn &&
        !isMonoBoldBtnOn &&
        !isMonoItalBtnOn &&
        !serifColor.value &&
        !sansColor.value &&
        !monoColor.value
        // serifSizeMult.value != "1" &&
        // sansSizeMult.value != "1" &&
        // monoSizeMult.value != "1"
    )
        applyButton.innerHTML = "No Changes Made";
    else {
        applyButton.textContent = "✔ Applied";
        if (!formButtons.contains(restoreButton))
            formButtons.prepend(restoreButton);
    }
    setTimeout(() => {
        applyButton.innerHTML = "Apply Selection";
    }, 1500);

    try {
        chrome.tabs.query(
            { active: true, lastFocusedWindow: true },
            async (tabs) => {
                const fontData: fontData = {
                    serif: {
                        font: serifValue.length ? serifValue : "Default",
                        bold: isSerifBoldBtnOn,
                        ital: isSerifItalBtnOn,
                        color: serifColor.value,
                        // sizeMultiplier: serifSizeMult.value,
                    },
                    sans_serif: {
                        font: sansSerifValue.length
                            ? sansSerifValue
                            : "Default",
                        bold: isSansBoldBtnOn,
                        ital: isSansItalBtnOn,
                        color: sansColor.value,
                        // sizeMultiplier: sansSizeMult.value,
                    },
                    monospace: {
                        font: monospaceValue.length
                            ? monospaceValue
                            : "Default",
                        bold: isMonoBoldBtnOn,
                        ital: isMonoItalBtnOn,
                        color: monoColor.value,
                        // sizeMultiplier: monoSizeMult.value,
                    },
                };

                // telling the service worker to apply the font
                chrome.tabs.connect(tabs[0].id).postMessage({
                    type: "apply_font",
                    data: fontData,
                });

                // saving the fonts to sync storage
                const domain = new URL(tabs[0].url).hostname;
                if (
                    serifValue.length ||
                    sansSerifValue.length ||
                    monospaceValue.length ||
                    isSansBoldBtnOn ||
                    isSansItalBtnOn ||
                    isSerifBoldBtnOn ||
                    isSerifItalBtnOn ||
                    isMonoBoldBtnOn ||
                    isMonoItalBtnOn ||
                    serifColor.value ||
                    sansColor.value ||
                    monoColor.value
                    // serifSizeMult.value != "1" ||
                    // sansSizeMult.value != "1" ||
                    // monoSizeMult.value != "1"
                ) {
                    await chrome.storage.sync.set({
                        [domain]: fontData,
                    });
                }

                // if global is checked, save to global_fonts
                // don't if the site has been exempted
                const exempts_list = await chrome.storage.sync.get(["exempts"]);
                if (
                    "exempts" in exempts_list &&
                    exempts_list["exempts"].includes(domain)
                ) {
                    console.log(
                        "This site has been exempted, so don't change the global fonts",
                    );
                } else {
                    const result = await chrome.storage.sync.get(["global"]);
                    if ("global" in result && result["global"])
                        await chrome.storage.sync.set({
                            global_fonts: fontData,
                        });
                }
            },
        );
    } catch (e) {
        console.error("Error applying or saving font.");
        console.error(e);
    }
});

globalFontSelectionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const globalSerifValue = globalSerifSelect.value;
    const globalSansSerifValue = globalSansSerifSelect.value;
    const globaMonospaceValue = globalMonospaceSelect.value;
    const applyButton = document.getElementById("global-apply-btn");
    if (
        !globalSerifValue.length &&
        !globalSansSerifValue.length &&
        !globaMonospaceValue.length
    )
        applyButton.innerHTML = "No Changes Made";
    else {
        applyButton.textContent = "Global fonts modified";
    }
    setTimeout(() => {
        applyButton.innerHTML = "🌐 Apply to all sites";
    }, 1500);

    const fontData: fontData = {
        serif: {
            font: globalSerifValue.length ? globalSerifValue : "Default",
            bold: isGlobalSerifBoldBtnOn,
            ital: isGlobalSerifItalBtnOn,
            color: globalSerifColor.value,
            // sizeMultiplier: globalSerifSizeMult.value,
        },
        sans_serif: {
            font: globalSansSerifValue.length
                ? globalSansSerifValue
                : "Default",
            bold: isGlobalSansBoldBtnOn,
            ital: isGlobalSansItalBtnOn,
            color: globalSansColor.value,
            // sizeMultiplier: globalSansSizeMult.value,
        },
        monospace: {
            font: globaMonospaceValue.length ? globaMonospaceValue : "Default",
            bold: isGlobalMonoBoldBtnOn,
            ital: isGlobalMonoItalBtnOn,
            color: globalMonoColor.value,
            // sizeMultiplier: globalMonoSizeMult.value,
        },
    };

    await chrome.storage.sync.set({
        global_fonts: fontData,
    });
});

restoreButton.addEventListener("click", async () => {
    const result = await chrome.storage.sync.get(["global"]);
    const domain = await getDomain();
    if ("global" in result && result["global"]) {
        const is_exempted = await chrome.storage.sync.get(["exempts"]);
        if (
            "exempts" in is_exempted &&
            is_exempted["exempts"].includes(domain)
        ) {
            // Only change for the site
            // Show refresh suggesion modal
            (
                document.getElementById("restore_modal") as HTMLDialogElement
            ).showModal();
            chrome.storage.sync.remove(domain);
            restoreButton.remove();
        } else {
            (
                document.getElementById("warning_modal") as HTMLDialogElement
            ).showModal();
            await chrome.storage.sync.set({
                global: false,
            });
            globalCheck.checked = false;
            showTip(tipText);
        }
    }
    updatePlaceholders({
        serif: "Default",
        sans_serif: "Default",
        monospace: "Default",
    });

    btnDeselect(serifBoldBtn);
    btnDeselect(sansBoldBtn);
    btnDeselect(monoBoldBtn);
    btnDeselect(serifItalBtn);
    btnDeselect(sansItalBtn);
    btnDeselect(monoItalBtn);

    isSerifBoldBtnOn = false;
    isSerifItalBtnOn = false;
    isSansBoldBtnOn = false;
    isSansItalBtnOn = false;
    isMonoBoldBtnOn = false;
    isMonoItalBtnOn = false;

    serifColor.value = "#000000";
    sansColor.value = "#000000";
    monoColor.value = "#000000";

    // sansSizeMult.value = "1";
    // serifSizeMult.value = "1";
    // monoSizeMult.value = "1";

    (document.getElementById("restore_modal") as HTMLDialogElement).showModal();
    chrome.storage.sync.remove(domain);
    restoreButton.remove();
});
