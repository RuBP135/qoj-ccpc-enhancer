const buttonId = "qoj-ccpc-settings";

const buttonStyles = `
.qoj-ccpc-header {
    position: relative;
}

.qoj-ccpc-settings-button {
    position: absolute;
    right: 0.5rem;
    bottom: 0;
    padding: 0;
    border: 0;
    background: none;
    color: #4472ff;
    font: inherit;
    cursor: pointer;
    white-space: nowrap;
}

.qoj-ccpc-settings-button:hover {
    text-decoration: underline;
}

.qoj-ccpc-settings-button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
}

@media (max-width: 600px) {
    .qoj-ccpc-settings-button {
        position: static;
        display: block;
        margin: 0.5rem 0.5rem 0 auto;
    }
}
`;

export function mountSettingsButton() {
    const header = document.querySelector(".uoj-content > .text-center");

    if (header === null) {
        return null;
    }

    const existingButton = header.querySelector(`#${buttonId}`);

    if (existingButton !== null) {
        return existingButton;
    }

    const button = document.createElement("button");
    button.id = buttonId;
    button.type = "button";
    button.className = "qoj-ccpc-settings-button";
    button.textContent = "CCPC-Enhancer 设置";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "qoj-ccpc-settings-dialog");

    const style = document.createElement("style");
    style.textContent = buttonStyles;
    document.head.append(style);

    header.classList.add("qoj-ccpc-header");
    header.append(button);

    return button;
}
