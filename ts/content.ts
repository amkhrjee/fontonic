let originalSerif: string, originalSansSerif: string, originalMonospace: string;

const changeFontFamily = (
    node: Node,
    serif: string,
    sansSerif: string,
    monospace: string,
) => {
    if (node.nodeType === 1) {
        const computedStyle = window.getComputedStyle(node as Element);
        const fontFamily = computedStyle.getPropertyValue("font-family");

        if (fontFamily) {
            if (fontFamily.includes("sans") && sansSerif != "Default") {
                (node as HTMLElement).style.fontFamily =
                    `'${sansSerif}', ${originalSansSerif}`;
            } else if (fontFamily.includes("serif") && serif != "Default") {
                (node as HTMLElement).style.fontFamily =
                    `'${serif}', ${originalSerif}`;
            } else if (
                fontFamily.includes("monospace") &&
                monospace != "Default"
            ) {
                (node as HTMLElement).style.fontFamily =
                    `'${monospace}', ${originalMonospace}`;
            }
        }
    }

    // Recursively process child nodes
    for (const childNode of node.childNodes) {
        changeFontFamily(childNode, serif, sansSerif, monospace);
    }
};

let message = {
    action: "on-page-load",
    domain: window.location.hostname,
};

// Tries to load font when page is loaded
chrome.runtime.sendMessage(message, undefined, (response) => {
    console.log("response received:", response.type);

    if (response.type === "apply_font") {
        const serif = response.data.serif;
        const sans_serif = response.data.sans_serif;
        const monospace = response.data.monospace;
        changeFontFamily(document.body, serif, sans_serif, monospace);
    } else if (response.type === "none") {
        console.log("Font not set for site");
    }
});

// Listens for the popup buttons
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
        {
            if (message.type === "apply_font") {
                const serif = message.data.serif;
                const sans_serif = message.data.sans_serif;
                const monospace = message.data.monospace;
                changeFontFamily(document.body, serif, sans_serif, monospace);
            } else if (message.type === "restore") {
                location.reload();
            } else if (message.type === "redirect") {
                window.open(message.data.redirect_url, "_blank");
            }
        }
    });
});
