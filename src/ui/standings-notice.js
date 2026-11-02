const noticeId = "qoj-ccpc-unrevealed-notice";
const styleId = "qoj-ccpc-unrevealed-notice-style";
const controlsClass = "qoj-ccpc-standings-controls";
let activeControls = null;

const noticeStyles = `
.${controlsClass} {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 1rem;
}

.${controlsClass} > label {
    flex-shrink: 0;
}

#${noticeId} {
    max-width: 100%;
    margin: 0 0 0.5rem;
    color: #6c757d;
    font-size: 0.875rem;
    line-height: 1.5;
    text-align: left;
    overflow-wrap: anywhere;
}

.${controlsClass} > #${noticeId} {
    margin-left: auto;
}

@media (max-width: 600px) {
    .${controlsClass} > #${noticeId} {
        flex-basis: 100%;
        margin-left: 0;
    }
}
`;

export function removeUnrevealedNotice() {
    document.getElementById(noticeId)?.remove();
    document.getElementById(styleId)?.remove();
    activeControls?.classList.remove(controlsClass);
    activeControls = null;
}

export function updateUnrevealedNotice(hasUnrevealedProblems) {
    const standings = document.querySelector("#standings");

    if (!hasUnrevealedProblems || standings === null) {
        removeUnrevealedNotice();
        return;
    }

    let style = document.getElementById(styleId);

    if (style === null) {
        style = document.createElement("style");
        style.id = styleId;
        style.textContent = noticeStyles;
        (document.head ?? document.documentElement).append(style);
    }

    let notice = document.getElementById(noticeId);

    if (notice === null) {
        notice = document.createElement("p");
        notice.id = noticeId;
        notice.textContent = "*未揭示题号区域的表头为题目统计，而各队记录为独立排序，因此上下不按列对应";
    }

    const controls = document.querySelector("#input-show_unofficial_mode")?.closest(".checkbox") ?? null;

    if (activeControls !== controls) {
        activeControls?.classList.remove(controlsClass);
        activeControls = controls;
    }

    if (controls === null) {
        standings.before(notice);
    } else {
        controls.classList.add(controlsClass);
        controls.append(notice);
    }
}
