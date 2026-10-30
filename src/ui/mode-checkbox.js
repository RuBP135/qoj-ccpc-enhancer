const checkboxId = "qoj-ccpc-mode";

const checkboxStyles = `
.qoj-ccpc-header {
    position: relative;
}

.qoj-ccpc-mode-control {
    position: absolute;
    right: 0;
    bottom: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin: 0;
    margin-right: 0.5rem;
    font-weight: normal;
    cursor: pointer;
    white-space: nowrap;
}

.qoj-ccpc-mode-control input {
    margin: 0;
}

@media (max-width: 600px) {
    .qoj-ccpc-mode-control {
        position: static;
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
    }
}
`;

export function mountModeCheckbox() {
    const header = document.querySelector(".uoj-content > .text-center");

    if (header === null) {
        return null;
    }

    const existingCheckbox = header.querySelector(`#${checkboxId}`);

    if (existingCheckbox !== null) {
        return existingCheckbox;
    }

    const checkbox = document.createElement("input");
    checkbox.id = checkboxId;
    checkbox.type = "checkbox";
    checkbox.checked = false;

    const label = document.createElement("label");
    label.className = "qoj-ccpc-mode-control";
    label.htmlFor = checkboxId;
    label.append(checkbox, "CCPC 新赛制");

    const style = document.createElement("style");
    style.textContent = checkboxStyles;
    document.head.append(style);

    header.classList.add("qoj-ccpc-header");
    header.append(label);

    return checkbox;
}
