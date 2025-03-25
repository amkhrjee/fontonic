type fontMetaData = {
    font: string;
    bold: boolean;
    ital: boolean;
};

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
        const lowerFontFamily = fontFamily.toLowerCase();
        if (
            (lowerFontFamily.includes("sans") &&
                !lowerFontFamily.includes("mono")) ||
            lowerFontFamily.includes("spotify") ||
            lowerFontFamily.includes("acumin")
        ) {
            element.style.fontStyle = sansSerif.ital ? "italic" : "";
            element.style.fontWeight = sansSerif.bold ? "bold" : "";
            if (sansSerif.font !== "Default") {
                element.style.fontFamily = `'${sansSerif.font}'`;
            }
        } else if (
            (lowerFontFamily.includes("serif") &&
                !lowerFontFamily.includes("mono")) ||
            lowerFontFamily.includes("times new roman")
        ) {
            element.style.fontStyle = serif.ital ? "italic" : "";
            element.style.fontWeight = serif.bold ? "bold" : "";
            if (serif.font !== "Default")
                element.style.fontFamily = `'${serif.font}'`;
        } else if (lowerFontFamily.includes("mono")) {
            element.style.fontStyle = monospace.ital ? "italic" : "";
            element.style.fontWeight = monospace.bold ? "bold" : "";
            if (monospace.font !== "Default")
                element.style.fontFamily = `'${monospace.font}'`;
        }
    }

    for (let i = 0; i < element.children.length; i++) {
        changeFontFamily(element.children[i], serif, sansSerif, monospace);
    }
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

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const addedNode of mutation.addedNodes) {
                    changeFontFamily(addedNode, serif, sans_serif, monospace);
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});

// Listens for the popup buttons
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
        {
            if (message.type === "apply_font") {
                const serif = message.data.serif as fontMetaData;
                const sans_serif = message.data.sans_serif as fontMetaData;
                const monospace = message.data.monospace as fontMetaData;
                changeFontFamily(document.body, serif, sans_serif, monospace);

                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        for (const addedNode of mutation.addedNodes) {
                            changeFontFamily(
                                addedNode,
                                serif,
                                sans_serif,
                                monospace,
                            );
                        }
                    }
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            } else if (message.type === "restore") {
                location.reload();
            } else if (message.type === "redirect") {
                window.open(message.data.redirect_url, "_blank");
            }
        }
    });
});
