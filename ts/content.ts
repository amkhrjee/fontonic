type fontMetaData = {
    font: string;
    bold: boolean;
    ital: boolean;
    color: string;
    ligatures: boolean;
    lineHeight: string;
    letterSpacing: string;
    wordSpacing: string;
    // sizeMultiplier: string;
};

const customizeFont = (element: HTMLElement, font: fontMetaData) => {
    element.style.fontStyle = font.ital ? "italic" : "";
    element.style.fontWeight = font.bold ? "bold" : "";

    if (font.color != "#000000") element.style.color = font.color;
    if (font.font !== "Default") {
        element.style.fontFamily = `'${font.font}'`;
    }

    // Apply ligatures
    if (font.ligatures) {
        element.style.fontVariantLigatures = "normal";
    } else {
        element.style.fontVariantLigatures = "none";
    }

    // Apply line height if set (not empty string)
    if (font.lineHeight && font.lineHeight !== "") {
        element.style.lineHeight = font.lineHeight;
    }

    // Apply letter spacing if set (not empty string)
    if (font.letterSpacing && font.letterSpacing !== "") {
        element.style.letterSpacing = font.letterSpacing;
    }

    // Apply word spacing if set (not empty string)
    if (font.wordSpacing && font.wordSpacing !== "") {
        element.style.wordSpacing = font.wordSpacing;
    }
};

const getFontFamilies = (fontFamily: string) =>
    fontFamily.split(",").map((family) =>
        family
            .trim()
            .replace(/^['"]|['"]$/g, "")
            .toLowerCase(),
    );

const matchesSelectedFont = (fontFamilies: string[], font: fontMetaData) =>
    font.font !== "Default" && fontFamilies.includes(font.font.toLowerCase());

type FontOperation = {
    element: HTMLElement;
    font: fontMetaData;
};

const collectFontOperations = (
    node: Node,
    serif: fontMetaData,
    sansSerif: fontMetaData,
    monospace: fontMetaData,
    operations: FontOperation[],
) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tagName = element.tagName.toUpperCase();

    // Ignore elements that shouldn't matter or are heavy
    if (
        tagName === "SCRIPT" ||
        tagName === "STYLE" ||
        tagName === "SVG" ||
        tagName === "PATH" ||
        tagName === "G" ||
        tagName === "CANVAS" ||
        tagName === "NOSCRIPT" ||
        tagName === "IFRAME"
    ) {
        return;
    }

    const fontFamily = getComputedStyle(element).fontFamily.toLowerCase();

    if (fontFamily) {
        const lowerFontFamily = fontFamily.toLowerCase();
        const fontFamilies = getFontFamilies(lowerFontFamily);

        let targetFont: fontMetaData | null = null;

        if (matchesSelectedFont(fontFamilies, monospace)) {
            targetFont = monospace;
        } else if (matchesSelectedFont(fontFamilies, serif)) {
            targetFont = serif;
        } else if (matchesSelectedFont(fontFamilies, sansSerif)) {
            targetFont = sansSerif;
        } else if (
            (lowerFontFamily.includes("sans") &&
                !lowerFontFamily.includes("mono")) ||
            lowerFontFamily.includes("spotify") ||
            lowerFontFamily.includes("acumin")
        ) {
            targetFont = sansSerif;
        } else if (
            (lowerFontFamily.includes("serif") &&
                !lowerFontFamily.includes("sans") &&
                !lowerFontFamily.includes("mono")) ||
            lowerFontFamily.includes("times new roman")
        ) {
            targetFont = serif;
        } else if (lowerFontFamily.includes("mono")) {
            targetFont = monospace;
        }

        if (targetFont) {
            operations.push({ element, font: targetFont });
        }
    }

    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        collectFontOperations(
            children[i],
            serif,
            sansSerif,
            monospace,
            operations,
        );
    }
};

const changeFontFamily = (
    node: Node,
    serif: fontMetaData,
    sansSerif: fontMetaData,
    monospace: fontMetaData,
) => {
    const operations: FontOperation[] = [];
    collectFontOperations(node, serif, sansSerif, monospace, operations);

    // Apply all gathered styles at once to avoid layout thrashing
    for (let i = 0; i < operations.length; i++) {
        customizeFont(operations[i].element, operations[i].font);
    }
};

let currentObserver: MutationObserver | null = null;

// Extract observer creation logic to avoid duplication
const createFontObserver = (
    serif: fontMetaData,
    sans_serif: fontMetaData,
    monospace: fontMetaData,
) => {
    if (currentObserver) {
        currentObserver.disconnect();
    }

    const pendingNodes = new Set<HTMLElement>();
    let rafId: number | null = null;

    currentObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            const addedNodes = mutation.addedNodes;
            for (let i = 0; i < addedNodes.length; i++) {
                const node = addedNodes[i];
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                const element = node as HTMLElement;
                let isAlreadyCovered = false;

                // Dynamic apps often report an inserted parent and its children
                // in one frame. Only retain roots so each subtree is scanned once.
                for (const pendingNode of pendingNodes) {
                    if (pendingNode.contains(element)) {
                        isAlreadyCovered = true;
                        break;
                    }

                    if (element.contains(pendingNode)) {
                        pendingNodes.delete(pendingNode);
                    }
                }

                if (!isAlreadyCovered) {
                    pendingNodes.add(element);
                }
            }
        }

        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                const operations: FontOperation[] = [];
                // Collect operations for all pending nodes
                for (const node of pendingNodes) {
                    if (!node.isConnected) continue;

                    collectFontOperations(
                        node,
                        serif,
                        sans_serif,
                        monospace,
                        operations,
                    );
                }
                pendingNodes.clear();
                rafId = null;

                // Execute all modifications after reads are complete
                for (let i = 0; i < operations.length; i++) {
                    customizeFont(operations[i].element, operations[i].font);
                }
            });
        }
    });

    return currentObserver;
};

let message = {
    action: "on-page-load",
    domain: window.location.hostname,
};

// Tries to load font when page is loaded
chrome.runtime.sendMessage(message, undefined, (response) => {
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
