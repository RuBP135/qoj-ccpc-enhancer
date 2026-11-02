import { defaultRevealPercentage, isValidRevealPercentage } from "../domain/problems.js";

const suggestedNeed = 50;

const dialogStyles = `
.qoj-ccpc-settings-dialog {
    width: min(30rem, calc(100vw - 2rem));
    max-height: calc(100vh - 2rem);
    padding: 0;
    border: 1px solid #d5d9df;
    border-radius: 0.4rem;
    background: #fff;
    color: #24292f;
    box-shadow: 0 1rem 3rem #0003;
    font: inherit;
    text-align: left;
}

.qoj-ccpc-settings-dialog::backdrop {
    background: #0006;
}

.qoj-ccpc-settings-dialog:not([open]),
.qoj-ccpc-settings-dialog [hidden] {
    display: none;
}

.qoj-ccpc-settings-dialog form {
    padding: 1.5rem;
}

.qoj-ccpc-settings-dialog h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-scope {
    margin: 0.4rem 0 1.25rem;
    color: #68717d;
    font-size: 0.875rem;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-selection {
    margin-bottom: 1.5rem;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source-title {
    margin-bottom: 0.5rem;
    color: #57606a;
    font-size: 0.875rem;
    font-weight: 600;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: hidden;
    border: 1px solid #b9c1cb;
    border-radius: 0.4rem;
    background: #f7f8fa;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source > label {
    position: relative;
    display: block;
    min-width: 0;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source > label + label {
    border-left: 1px solid #b9c1cb;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source input[type="radio"] {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source span {
    display: grid;
    place-items: center;
    box-sizing: border-box;
    min-height: 2.5rem;
    height: 100%;
    padding: 0.5rem;
    color: #57606a;
    font-size: 0.9375rem;
    line-height: 1.4;
    text-align: center;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source label:hover span {
    background: #e9edf5;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source input:checked + span {
    background: #4472ff;
    color: #fff;
    font-weight: 600;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-source input:focus-visible + span {
    outline: 2px solid #1f2937;
    outline-offset: -3px;
}

.qoj-ccpc-settings-dialog label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-weight: normal;
    cursor: pointer;
}

.qoj-ccpc-settings-dialog input[type="checkbox"],
.qoj-ccpc-settings-dialog input[type="radio"] {
    margin: 0;
}

.qoj-ccpc-settings-dialog fieldset {
    min-width: 0;
    margin: 1.25rem 0 0;
    padding: 0;
    border: 0;
}

.qoj-ccpc-settings-dialog legend {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 600;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-condition-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.qoj-ccpc-settings-dialog input[type="text"] {
    width: 6rem;
    padding: 0.3rem 0.5rem;
    border: 1px solid #b9c1cb;
    border-radius: 0.25rem;
    font: inherit;
}

.qoj-ccpc-settings-dialog input:disabled {
    background: #f1f3f5;
    color: #68717d;
}

.qoj-ccpc-settings-dialog .qoj-ccpc-settings-error {
    margin: 0.75rem 0 0;
    color: #bf2631;
}

.qoj-ccpc-settings-dialog footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e3e7ec;
}

.qoj-ccpc-settings-dialog button {
    padding: 0.4rem 0.9rem;
    border: 1px solid #b9c1cb;
    border-radius: 0.25rem;
    background: #fff;
    color: inherit;
    font: inherit;
    cursor: pointer;
}

.qoj-ccpc-settings-dialog button[type="submit"] {
    border-color: #4472ff;
    background: #4472ff;
    color: #fff;
}

.qoj-ccpc-settings-dialog button:hover {
    filter: brightness(0.95);
}

.qoj-ccpc-settings-dialog :focus-visible {
    outline: 2px solid #4472ff;
    outline-offset: 2px;
}
`;

function createSettingsDraft(settings) {
    return {
        enabled: settings.enabled,
        needEnabled: settings.need !== null,
        needValue: String(settings.need ?? suggestedNeed),
        percentageEnabled: settings.percentage !== null,
        percentageValue: String(settings.percentage ?? defaultRevealPercentage),
    };
}

function settingsMatch(left, right) {
    return right !== null &&
        left.enabled === right.enabled &&
        left.need === right.need &&
        left.percentage === right.percentage;
}

export function createSettingsDialog({ onSave }) {
    const dialog = document.createElement("dialog");
    dialog.id = "qoj-ccpc-settings-dialog";
    dialog.className = "qoj-ccpc-settings-dialog";
    dialog.setAttribute("aria-labelledby", "qoj-ccpc-settings-title");
    dialog.setAttribute("aria-describedby", "qoj-ccpc-settings-scope");
    dialog.innerHTML = `
        <form novalidate>
            <h2 id="qoj-ccpc-settings-title">CCPC 新赛制榜单显示设置</h2>
            <p id="qoj-ccpc-settings-scope" class="qoj-ccpc-settings-scope">仅适用于 ICPC 赛制。</p>
            <div class="qoj-ccpc-settings-selection">
                <div id="qoj-ccpc-settings-source-title" class="qoj-ccpc-settings-source-title">当前比赛采用</div>
                <div class="qoj-ccpc-settings-source" role="group" aria-labelledby="qoj-ccpc-settings-source-title">
                    <label>
                        <input type="radio" name="settingsSource" value="global">
                        <span>全局设置</span>
                    </label>
                    <label>
                        <input type="radio" name="settingsSource" value="contest">
                        <span>专用设置</span>
                    </label>
                </div>
            </div>
            <label>
                <input type="checkbox" name="enabled">
                启用 CCPC 新赛制榜单
            </label>
            <fieldset>
                <legend>固定人数揭示条件</legend>
                <label>
                    <input type="radio" name="needMode" value="disabled">
                    不启用
                </label>
                <div class="qoj-ccpc-condition-row">
                    <label>
                        <input type="radio" name="needMode" value="custom">
                        启用，人数：
                    </label>
                    <input type="text" name="needValue" inputmode="numeric" autocomplete="off"
                        aria-label="固定过题人数">
                </div>
            </fieldset>
            <fieldset>
                <legend>百分比揭示条件</legend>
                <label>
                    <input type="radio" name="percentageMode" value="disabled">
                    不启用
                </label>
                <div class="qoj-ccpc-condition-row">
                    <label>
                        <input type="radio" name="percentageMode" value="custom">
                        启用，比例：
                    </label>
                    <input type="text" name="percentageValue" inputmode="decimal" autocomplete="off"
                        aria-label="过题队伍比例（百分比）">
                    <span aria-hidden="true">%</span>
                </div>
            </fieldset>
            <p class="qoj-ccpc-settings-error" role="alert" hidden></p>
            <footer>
                <button type="button" data-action="cancel">取消</button>
                <button type="submit">保存</button>
            </footer>
        </form>
    `;

    const style = document.createElement("style");
    style.textContent = dialogStyles;
    document.head.append(style);
    document.body.append(dialog);

    const form = dialog.querySelector("form");
    const globalSourceOption = form.querySelector('[name="settingsSource"][value="global"]');
    const contestSourceOption = form.querySelector('[name="settingsSource"][value="contest"]');
    const enabledInput = form.querySelector('[name="enabled"]');
    const disabledOption = form.querySelector('[name="needMode"][value="disabled"]');
    const customOption = form.querySelector('[name="needMode"][value="custom"]');
    const needInput = form.querySelector('[name="needValue"]');
    const percentageDisabledOption = form.querySelector('[name="percentageMode"][value="disabled"]');
    const percentageCustomOption = form.querySelector('[name="percentageMode"][value="custom"]');
    const percentageInput = form.querySelector('[name="percentageValue"]');
    const errorMessage = form.querySelector('[role="alert"]');

    let activeSource = "global";
    let drafts = null;
    let initialSettings = null;

    function clearError() {
        errorMessage.hidden = true;
        errorMessage.textContent = "";
        needInput.removeAttribute("aria-invalid");
        percentageInput.removeAttribute("aria-invalid");
    }

    function updateNeedInput() {
        needInput.disabled = !customOption.checked;
        clearError();
    }

    function updatePercentageInput() {
        percentageInput.disabled = !percentageCustomOption.checked;
        clearError();
    }

    function readInputs() {
        return {
            enabled: enabledInput.checked,
            needEnabled: customOption.checked,
            needValue: needInput.value,
            percentageEnabled: percentageCustomOption.checked,
            percentageValue: percentageInput.value,
        };
    }

    function renderDraft() {
        const draft = drafts[activeSource];
        globalSourceOption.checked = activeSource === "global";
        contestSourceOption.checked = activeSource === "contest";
        enabledInput.checked = draft.enabled;
        disabledOption.checked = !draft.needEnabled;
        customOption.checked = draft.needEnabled;
        needInput.value = draft.needValue;
        percentageDisabledOption.checked = !draft.percentageEnabled;
        percentageCustomOption.checked = draft.percentageEnabled;
        percentageInput.value = draft.percentageValue;
        updateNeedInput();
        updatePercentageInput();
    }

    function switchSource(source) {
        drafts[activeSource] = readInputs();

        if (drafts[source] === null) {
            drafts[source] = { ...drafts.global };
        }

        activeSource = source;
        renderDraft();
    }

    function showDraftError(source, input, message) {
        activeSource = source;
        renderDraft();
        errorMessage.textContent = message;
        errorMessage.hidden = false;
        input.setAttribute("aria-invalid", "true");
        input.focus();
    }

    function parseDraft(source) {
        const draft = drafts[source];
        const needText = draft.needValue.trim();
        const need = draft.needEnabled ? Number(needText) : null;
        const percentageText = draft.percentageValue.trim();
        const percentage = draft.percentageEnabled ? Number(percentageText) : null;

        if (draft.needEnabled && (!/^\d+$/.test(needText) || !Number.isSafeInteger(need) || need <= 0)) {
            showDraftError(source, needInput, "请输入有效的正整数。");
            return null;
        }

        if (draft.percentageEnabled &&
            (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(percentageText) || !isValidRevealPercentage(percentage))) {
            showDraftError(source, percentageInput, "请输入大于 0 且不超过 100 的整数/小数");
            return null;
        }

        return { enabled: draft.enabled, need, percentage };
    }

    globalSourceOption.addEventListener("change", () => {
        if (globalSourceOption.checked) {
            switchSource("global");
        }
    });
    contestSourceOption.addEventListener("change", () => {
        if (contestSourceOption.checked) {
            switchSource("contest");
        }
    });
    disabledOption.addEventListener("change", updateNeedInput);
    customOption.addEventListener("change", updateNeedInput);
    percentageDisabledOption.addEventListener("change", updatePercentageInput);
    percentageCustomOption.addEventListener("change", updatePercentageInput);
    form.querySelector('[data-action="cancel"]').addEventListener("click", () => {
        dialog.close();
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearError();
        drafts[activeSource] = readInputs();
        const updatedSettings = { source: activeSource };

        for (const source of ["global", "contest"]) {
            if (drafts[source] === null) {
                continue;
            }

            const settings = parseDraft(source);

            if (settings === null) {
                return;
            }

            if (!settingsMatch(settings, initialSettings[source])) {
                const key = source === "global" ? "globalSettings" : "contestSettings";
                updatedSettings[key] = settings;
            }
        }

        try {
            onSave(updatedSettings);
        } catch (error) {
            console.error("[QOJ CCPC Enhancer] 保存设置失败", error);
            errorMessage.textContent = "保存失败，请重试。";
            errorMessage.hidden = false;
            return;
        }

        dialog.close();
    });

    return {
        open(settings) {
            if (dialog.open) {
                return;
            }

            initialSettings = {
                global: { ...settings.globalSettings },
                contest: settings.contestSettings === null ? null : { ...settings.contestSettings },
            };
            drafts = {
                global: createSettingsDraft(initialSettings.global),
                contest: initialSettings.contest === null ? null : createSettingsDraft(initialSettings.contest),
            };
            activeSource = settings.source === "contest" ? "contest" : "global";

            if (drafts[activeSource] === null) {
                drafts[activeSource] = { ...drafts.global };
            }

            renderDraft();
            dialog.showModal();
        },
    };
}
