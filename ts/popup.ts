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

tipWhenOverrideOn.remove();
tipWhenOverrideOff.remove();
tipWhenSiteIsExempted.remove();

const showTip = (tip: HTMLElement) => {
  tipBox.removeChild(tipBox.children[0]);
  tipBox.appendChild(tip);
  return true;
};

const getDomain = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return new URL(tab.url!).hostname;
};

// by default these extra pages are unmounted
settingsPage.remove();
supportPage.remove();
restoreButton.remove();

const goToSettings = () => {
  settingsButton.click();
};

// Check for configuration settings
chrome.storage.sync.get(["global"]).then((result) => {
  globalCheck.checked = "global" in result && result["global"];

  if (globalCheck.checked) {
    overrideCheck.disabled = false;
    exemptCheck.disabled = false;

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
      } else showTip(tipText);
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

// Populating placeholder values + checkbox
type fontData = {
  serif: string;
  sans_serif: string;
  monospace: string;
};
const updatePlaceholders = (innerText: fontData) => {
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

getDomain().then((domain) => {
  chrome.storage.sync.get([domain]).then((result) => {
    if (Object.keys(result).length != 0) {
      const fontData = result[domain];
      updatePlaceholders(fontData);
      formButtons.prepend(restoreButton);
    }
  });
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
        const fontData = {
          serif: serifValue.length ? serifValue : "Default",
          sans_serif: sansSerifValue.length ? sansSerifValue : "Default",
          monospace: monospaceValue.length ? monospaceValue : "Default",
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
      }
    );
  } catch (e) {
    console.error("Error applying or saving font.");
    console.error(e);
  }
});

restoreButton.addEventListener("click", async () => {
  const result = await chrome.storage.sync.get(["global"]);
  if ("global" in result && result["global"]) {
    (document.getElementById("warning_modal") as HTMLDialogElement).showModal();
    await chrome.storage.sync.set({
      global: false,
    });
    globalCheck.checked = false;
    showTip(tipText);
  }
  updatePlaceholders({
    serif: "Default",
    sans_serif: "Default",
    monospace: "Default",
  });

  chrome.storage.sync.remove(await getDomain());
  restoreButton.remove();
});
