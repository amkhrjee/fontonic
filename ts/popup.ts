const settingsButton = document.getElementById("settings-btn");
const supportButton = document.getElementById("support-btn");
const homePage = document.getElementById("home-page");
const settingsPage = document.getElementById("settings-page");
const wrapper = document.getElementById("wrapper");

// by default these extra pages are unmounted
settingsPage.remove();
settingsButton.addEventListener("click", () => {
  if (settingsButton.textContent.charAt(0) === "S") {
    settingsButton.textContent = "Go back";
    homePage.remove();
    wrapper.appendChild(settingsPage);
  } else {
    settingsButton.textContent = "Settings";
    settingsPage.remove();
    wrapper.appendChild(homePage);
  }
});
supportButton.addEventListener("click", () => {
  supportButton.textContent.includes("❤")
    ? (supportButton.textContent = "<- Go back")
    : (supportButton.textContent = "❤ Support");
});
