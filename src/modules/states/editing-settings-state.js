import Settings from "../settings.js";
import Screen from "../screen.js";

export default class EditingSettingsState {
    openButton = Screen.buttons.settingsButton;
    closeButton = Screen.buttons.settingsCloseButton;
    window = Screen.windows.settingsWindow;

    constructor() {
        this.isWindowOpen = false;
        this.isDropdownOpen = false;
        this.currentOpenDropdown = null;
    }
    
    enter() {
        this.window.classList.remove("hidden");
        this.openButton.classList.add("active-button");
        this.isWindowOpen = true;
        let dropdowns = this.window.querySelectorAll(".dropdown");
        for (let i = 0; i < dropdowns.length; ++i) {
            let dropdown = dropdowns[i];
            let dropdownSettingValue = dropdown.dataset.setting;
            let dropdownButton = dropdown.querySelector("div.active-dropdown-background");
            let dropdownLabel = dropdown.querySelector("div.active-dropdown-value");
            let dropdownOptionsContainer = dropdowns[i].querySelector("div.dropdown-options-container");
            let dropdownOptions = dropdownOptionsContainer.querySelectorAll(".dropdown-option");
            dropdownButton.onclick = () => {
                if (this.isDropdownOpen == false && this.currentOpenDropdown === null) {
                    this.isDropdownOpen = true;
                    this.currentOpenDropdown = dropdownSettingValue;
                    let optionClicked = false; // why?
                    dropdownOptionsContainer.classList.remove("hidden");
                    for (let i = 0; i < dropdownOptions.length; ++i) {
                        // iterate through each option
                        let option = dropdownOptions[i];
                        option.onclick = () => {
                            if (optionClicked == false) {
                                let currentOptionValue = option.dataset.value;
                                optionClicked = true;
                                option.onclick = () => {};
                                dropdownOptionsContainer.classList.add("hidden");
                                dropdownLabel.innerHTML = currentOptionValue;
                                // settingValues[dropdownSettingValue] = currentOptionValue;
                                Settings.set(dropdownSettingValue, currentOptionValue);
                                this.currentOpenDropdown = null;
                                this.isDropdownOpen = false;
                                optionClicked = false;
                            }
                        };
                    }
                } else if (this.isDropdownOpen == true && dropdownSettingValue === this.currentOpenDropdown) {
                    for (let i = 0; i < dropdownOptions.length; ++i) {
                        dropdownOptions[i].onclick = () => {};
                    }
                    dropdownOptionsContainer.classList.add("hidden");
                    this.isDropdownOpen = false;
                    this.currentOpenDropdown = null;
                }
            };
        }
    }

    exit() {
        if (this.isDropdownOpen && this.currentOpenDropdown !== null) {
            let dropdown = this.window.querySelector(`.dropdown[data-setting=${this.currentOpenDropdown}]`);
            let dropdownOptionsContainer = dropdown.querySelector("div.dropdown-options-container");
            let dropdownOptions = dropdownOptionsContainer.querySelectorAll("div.dropdown-option");
            for (let i = 0; i < dropdownOptions.length; ++i) {
                dropdownOptions[i].onclick = () => {};
            }
            dropdownOptionsContainer.classList.add("hidden");
            this.isDropdownOpen = false;
            this.currentOpenDropdown = null;
        }
        this.window.classList.add("hidden");
        this.openButton.classList.remove("active-button");
        this.isWindowOpen = false;
    }

    handleButtonInput(button, actionType) {
        if (actionType !== "click") return;

        if (button === this.openButton) {
            if (this.isWindowOpen) {
                this.exit();
            } else {
                this.enter();
            }
        } else if (button === this.closeButton || Screen.isToolbarButton(button)) {
            this.exit();
        }
    }

    toString() {
        return "EditingSettingsState";
    }

    handleMouseInput(eventInfo, actionType) {}
    frameUpdate() {}
}