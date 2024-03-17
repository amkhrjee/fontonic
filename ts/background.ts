chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "on-page-load") {
        /*
      Checks on page load whether the font for the domain already exists in the storage
      If it does, then gets the font and applies it to the page
    */
        chrome.storage.sync
            .get([message.domain])
            .then(async (result) => {
                const fontData = result[message.domain];
                if (fontData) {
                    console.log("Font Found!");
                    let override_setting = await chrome.storage.sync.get([
                        "override",
                    ]);
                    console.log("Value of override", override_setting);

                    if (!override_setting["override"]) {
                        sendResponse({
                            type: "apply_font",
                            data: {
                                serif: fontData.serif,
                                sans_serif: fontData.sans_serif,
                                monospace: fontData.monospace,
                            },
                        });
                    } else {
                        console.log("I am Here");

                        chrome.storage.sync
                            .get(["lastUsed"])
                            .then((result) => {
                                const fontData = result["lastUsed"];
                                console.log(fontData);

                                if (fontData) {
                                    console.log("Font Found!");
                                    sendResponse({
                                        type: "apply_font",
                                        data: {
                                            serif: fontData.serif,
                                            sans_serif: fontData.sans_serif,
                                            monospace: fontData.monospace,
                                        },
                                    });
                                } else {
                                    sendResponse({
                                        type: "none",
                                    });
                                    console.log("Font Not Found");
                                }
                            })
                            .catch((err) => {
                                console.error(
                                    "Error in getting lastUsed:",
                                    err,
                                );
                            });
                    }
                }
            })
            .catch((err) => {
                console.error(err);
            });

        chrome.storage.sync
            .get(["override"])
            .then((result) => {
                if (result["override"]) {
                    console.log("Override value is true");

                    chrome.storage.sync
                        .get(["lastUsed"])
                        .then((result) => {
                            const fontData = result["lastUsed"];
                            console.log(fontData);

                            if (fontData) {
                                console.log("Font Found!");
                                sendResponse({
                                    type: "apply_font",
                                    data: {
                                        serif: fontData.serif,
                                        sans_serif: fontData.sans_serif,
                                        monospace: fontData.monospace,
                                    },
                                });
                            } else {
                                sendResponse({
                                    type: "none",
                                });
                                console.log("Font Not Found");
                            }
                        })
                        .catch((err) => {
                            console.error("Error in getting lastUsed:", err);
                        });
                } else {
                    console.log("Global is Not Set");
                }
            })
            .catch((err) => {
                console.error("Error in getting global scope:", err);
            });
    }
    // This must be returning true to keep listening
    // read more: https://stackoverflow.com/a/56483156/12404524
    return true;
});
