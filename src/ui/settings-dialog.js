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

export function createSettingsDialog({ onSave }) {
    const dialog = document.createElement("dialog");
    dialog.id = "qoj-ccpc-settings-dialog";
    dialog.className = "qoj-ccpc-settings-dialog";
    dialog.setAttribute("aria-labelledby", "qoj-ccpc-settings-title");
    dialog.setAttribute("aria-describedby", "qoj-ccpc-settings-scope");
    dialog.innerHTML = `
        <form novalidate>
            <h2 id="qoj-ccpc-settings-title">CCPC 新赛制榜单显示设置</h2>
            <p id="qoj-ccpc-settings-scope" class="qoj-ccpc-settings-scope">仅对当前比赛生效（仅适用于 ICPC 赛制）。</p>
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
    const enabledInput = form.querySelector('[name="enabled"]');
    const disabledOption = form.querySelector('[name="needMode"][value="disabled"]');
    const customOption = form.querySelector('[name="needMode"][value="custom"]');
    const needInput = form.querySelector('[name="needValue"]');
    const percentageDisabledOption = form.querySelector('[name="percentageMode"][value="disabled"]');
    const percentageCustomOption = form.querySelector('[name="percentageMode"][value="custom"]');
    const percentageInput = form.querySelector('[name="percentageValue"]');
    const errorMessage = form.querySelector('[role="alert"]');

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

        const text = needInput.value.trim();
        const need = customOption.checked ? Number(text) : null;
        const percentageText = percentageInput.value.trim();
        const percentage = percentageCustomOption.checked ? Number(percentageText) : null;

        if (customOption.checked && (!/^\d+$/.test(text) || !Number.isSafeInteger(need) || need <= 0)) {
            errorMessage.textContent = "请输入有效的正整数。";
            errorMessage.hidden = false;
            needInput.setAttribute("aria-invalid", "true");
            needInput.focus();
            return;
        }

        if (percentageCustomOption.checked &&
            (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(percentageText) || !isValidRevealPercentage(percentage))) {
            errorMessage.textContent = "请输入大于 0 且不超过 100 的整数/小数";
            errorMessage.hidden = false;
            percentageInput.setAttribute("aria-invalid", "true");
            percentageInput.focus();
            return;
        }

        try {
            onSave({ enabled: enabledInput.checked, need, percentage });
        } catch (error) {
            console.error("[QOJ CCPC Enhancer] 保存比赛设置失败", error);
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

            enabledInput.checked = settings.enabled;
            disabledOption.checked = settings.need === null;
            customOption.checked = settings.need !== null;
            needInput.value = String(settings.need ?? suggestedNeed);
            percentageDisabledOption.checked = settings.percentage === null;
            percentageCustomOption.checked = settings.percentage !== null;
            percentageInput.value = String(settings.percentage ?? defaultRevealPercentage);
            updateNeedInput();
            updatePercentageInput();
            dialog.showModal();
        },
    };
}
