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
  "override_check"
) as HTMLInputElement;
const exemptCheck = document.getElementById("exempt_check") as HTMLInputElement;
const tipText = document.getElementById("tip");
const tipWhenOverrideOn = document.getElementById("tip-override-on");
const tipWhenOverrideOff = document.getElementById("tip-override-off");
const tipWhenSiteIsExempted = document.getElementById("tip-exempt");
const tipBox = document.getElementById("tip-box");
const globalNotSelectedInfoText = document.getElementById(
  "global_not_checked_info_text"
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
  "#global_serif_placeholder"
) as HTMLOptionElement;
const globalSansSerifPlaceholder = document.querySelector(
  "#global_sans_serif_placeholder"
) as HTMLOptionElement;
const globalMonospacePlaceholder = document.querySelector(
  "#global_monospace_placeholder"
) as HTMLOptionElement;

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
        if (tabs[0] && tabs[0].url) resolve(new URL(tabs[0].url).hostname);
        else reject(new Error("Could not return tab url"));
      }
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
      const global_fonts = globalFonts["global_fonts"];
      // Placeholder text content
      globalSerifPlaceholder.innerHTML = global_fonts.serif;
      globalSansSerifPlaceholder.innerHTML = global_fonts.sans_serif;
      globalMonospacePlaceholder.innerHTML = global_fonts.monospace;

      // Placeholder value
      globalSerifPlaceholder.value =
        global_fonts.serif === "Default" ? "" : global_fonts.serif;
      globalSansSerifPlaceholder.value =
        global_fonts.sans_serif === "Default" ? "" : global_fonts.sans_serif;
      globalMonospacePlaceholder.value =
        global_fonts.monospace === "Default" ? "" : global_fonts.monospace;
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
    supportButton.textContent = "❤ Support";
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
        showTip(overrideCheck.checked ? tipWhenOverrideOn : tipWhenOverrideOff);
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
        const globalFonts = await chrome.storage.sync.get(["global_fonts"]);
        if ("global_fonts" in globalFonts) {
          const global_fonts = globalFonts["global_fonts"];
          // Placeholder text content
          globalSerifPlaceholder.innerHTML = global_fonts.serif;
          globalSansSerifPlaceholder.innerHTML = global_fonts.sans_serif;
          globalMonospacePlaceholder.innerHTML = global_fonts.monospace;

          // Placeholder value
          globalSerifPlaceholder.value =
            global_fonts.serif === "Default" ? "" : global_fonts.serif;
          globalSansSerifPlaceholder.value =
            global_fonts.sans_serif === "Default"
              ? ""
              : global_fonts.sans_serif;
          globalMonospacePlaceholder.value =
            global_fonts.monospace === "Default" ? "" : global_fonts.monospace;
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
      showTip(overrideCheck.checked ? tipWhenOverrideOn : tipWhenOverrideOff);
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
        exempted_domains = exempted_domains.filter((el) => el !== domain);
        showTip(overrideCheck.checked ? tipWhenOverrideOn : tipWhenOverrideOff);
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
  if (supportButton.textContent.includes("❤")) {
    supportButton.textContent = "<- Go back";
    if (settingsButton.textContent.includes("G")) settingsPage.remove();
    else homePage.remove();
    settingsButton.textContent = "Settings";
    wrapper.appendChild(supportPage);
  } else {
    supportButton.textContent = "❤ Support";
    supportPage.remove();
    wrapper.appendChild(homePage);
  }
});

type fontData = {
  serif: {
    font: string;
    bold: boolean;
    ital: boolean;
  };
  sans_serif: {
    font: string;
    bold: boolean;
    ital: boolean;
  };
  monospace: {
    font: string;
    bold: boolean;
    ital: boolean;
  };
};
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
  "#serif_placeholder"
) as HTMLOptionElement;
const sansSerifPlaceholder = document.querySelector(
  "#sans_serif_placeholder"
) as HTMLOptionElement;
const monospacePlaceholder = document.querySelector(
  "#monospace_placeholder"
) as HTMLOptionElement;

type Placeholder = {
  serif: string;
  sans_serif: string;
  monospace: string;
};

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
  node.style.backgroundColor = "oklch(var(--s))";
  node.style.color = "oklch(var(--sc))";
};

const btnDeselect = (node: HTMLElement) => {
  node.style.backgroundColor = "oklch(var(--n))";
  node.style.color = "oklch(var(--nc))";
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

let isSerifBoldBtnOn: boolean;
let isSerifItalBtnOn: boolean;

let isSansBoldBtnOn: boolean;
let isSansItalBtnOn: boolean;

let isMonoBoldBtnOn: boolean;
let isMonoItalBtnOn: boolean;

// Update the Bold and Ital Buttons when popup loaded for a site
getDomain().then((domain) => {
  chrome.storage.sync.get([domain]).then((result) => {
    if (Object.keys(result).length != 0) {
      const fontData = result[domain] as fontData;
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
  if (!serifValue.length && !sansSerifValue.length && !monospaceValue.length)
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
        // telling the service worker to apply the font
        const fontData: fontData = {
          serif: {
            font: serifValue.length ? serifValue : "Default",
            bold: isSerifBoldBtnOn,
            ital: isSerifItalBtnOn,
          },
          sans_serif: {
            font: sansSerifValue.length ? sansSerifValue : "Default",
            bold: isSansBoldBtnOn,
            ital: isSansItalBtnOn,
          },
          monospace: {
            font: monospaceValue.length ? monospaceValue : "Default",
            bold: isMonoBoldBtnOn,
            ital: isMonoItalBtnOn,
          },
        };

        chrome.tabs.connect(tabs[0].id).postMessage({
          type: "apply_font",
          data: fontData,
        });

        // saving the fonts to sync storage
        const domain = new URL(tabs[0].url).hostname;
        if (
          serifValue.length ||
          sansSerifValue.length ||
          monospaceValue.length
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
            "This site has been exempted, so don't change the global fonts"
          );
        } else {
          const result = await chrome.storage.sync.get(["global"]);
          if ("global" in result && result["global"])
            await chrome.storage.sync.set({
              global_fonts: fontData,
            });
        }
      }
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

  await chrome.storage.sync.set({
    global_fonts: {
      serif: globalSerifValue.length ? globalSerifValue : "Default",
      sans_serif: globalSansSerifValue.length
        ? globalSansSerifValue
        : "Default",
      monospace: globaMonospaceValue.length ? globaMonospaceValue : "Default",
    },
  });
});

restoreButton.addEventListener("click", async () => {
  const result = await chrome.storage.sync.get(["global"]);
  const domain = await getDomain();
  if ("global" in result && result["global"]) {
    const is_exempted = await chrome.storage.sync.get(["exempts"]);
    if ("exempts" in is_exempted && is_exempted["exempts"].includes(domain)) {
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
  (document.getElementById("restore_modal") as HTMLDialogElement).showModal();
  chrome.storage.sync.remove(await getDomain());
  restoreButton.remove();
});
