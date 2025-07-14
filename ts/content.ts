type fontMetaData = {
    font: string;
    bold: boolean;
    ital: boolean;
    color: string;
    // sizeMultiplier: string;
};

const customizeFont = (element: HTMLElement, font: fontMetaData) => {
    element.style.fontStyle = font.ital ? "italic" : "";
    element.style.fontWeight = font.bold ? "bold" : "";

    if (font.color != "#000000") element.style.color = font.color;
    if (font.font !== "Default") {
        element.style.fontFamily = `'${font.font}'`;
    }
};

// Cache target fonts to avoid recreating array on every call
let cachedTargetFonts: string[] | null = null;

const changeFontFamily = (
    node: Node,
    serif: fontMetaData,
    sansSerif: fontMetaData,
    monospace: fontMetaData,
) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;

    const fontFamily = getComputedStyle(element).fontFamily.toLowerCase();

    if (fontFamily) {
        if (fontFamily.includes("mono")) {
            customizeFont(element, monospace);
        } else if (fontFamily.includes("sans")) {
            customizeFont(element, sansSerif);
        } else if (fontFamily.includes("serif")) {
            customizeFont(element, serif);
        } else {
            // Cache target fonts array to avoid recreating it
            if (!cachedTargetFonts) {
                cachedTargetFonts = [
                    monospace.font.toLowerCase(),
                    serif.font.toLowerCase(),
                    sansSerif.font.toLowerCase(),
                ];
            }
            if (!cachedTargetFonts.includes(fontFamily)) {
                customizeFont(element, sansSerif);
            }
        }
    }

    // More efficient child iteration
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        changeFontFamily(children[i], serif, sansSerif, monospace);
    }
};

// Extract observer creation logic to avoid duplication
const createFontObserver = (
    serif: fontMetaData,
    sans_serif: fontMetaData,
    monospace: fontMetaData,
) => {
    return new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            const addedNodes = mutation.addedNodes;
            for (let i = 0; i < addedNodes.length; i++) {
                changeFontFamily(addedNodes[i], serif, sans_serif, monospace);
            }
        }
    });
};

let message = {
    action: "on-page-load",
    domain: window.location.hostname,
};

// Tries to load font when page is loaded
chrome.runtime.sendMessage(message, undefined, (response) => {
    // console.log("response received:", response.type);
    // console.log(response.data);

    if (response.type === "apply_font") {
        const serif = response.data.serif as fontMetaData;
        const sans_serif = response.data.sans_serif as fontMetaData;
        const monospace = response.data.monospace as fontMetaData;

        changeFontFamily(document.body, serif, sans_serif, monospace);

        const observer = createFontObserver(serif, sans_serif, monospace);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
});

// Listens for the popup buttons
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
        if (message.type === "apply_font") {
            const serif = message.data.serif as fontMetaData;
            const sans_serif = message.data.sans_serif as fontMetaData;
            const monospace = message.data.monospace as fontMetaData;
            changeFontFamily(document.body, serif, sans_serif, monospace);

            const observer = createFontObserver(serif, sans_serif, monospace);
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        } else if (message.type === "restore") {
            location.reload();
        } else if (message.type === "redirect") {
            window.open(message.data.redirect_url, "_blank");
        }
    });
});
