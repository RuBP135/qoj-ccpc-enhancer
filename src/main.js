import { getContestPageContext } from "./qoj/page.js";
import { loadContestSettings, saveContestSettings } from "./settings.js";
import { mountModeCheckbox } from "./ui/mode-checkbox.js";

const contestPage = getContestPageContext();

if (contestPage !== null) {
    const modeCheckbox = mountModeCheckbox();

    if (modeCheckbox !== null) {
        let settings = loadContestSettings(contestPage.id);
        modeCheckbox.checked = settings.enabled;

        modeCheckbox.addEventListener("change", () => {
            const updatedSettings = { enabled: modeCheckbox.checked };

            try {
                saveContestSettings(contestPage.id, updatedSettings);
                settings = updatedSettings;
            } catch (error) {
                modeCheckbox.checked = settings.enabled;
                console.error("[QOJ CCPC Enhancer] 保存比赛设置失败", error);
            }
        });

        console.info(`[QOJ CCPC Enhancer] 已初始化比赛 ${contestPage.id}`);
    }
}
