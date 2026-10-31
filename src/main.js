import { getContestPageContext, isSupportedStandingsPage } from "./qoj/page.js";
import { getStandingsData } from "./qoj/standings.js";
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

            if (settings.enabled !== updatedSettings.enabled) {
                const message = updatedSettings.enabled
                    ? "确认为当前比赛启用 CCPC 新赛制的榜单显示？"
                    : "取消后会立即切换回到原来的榜单，可能导致看到更详细的过题情况，确定吗";
                const confirmed = window.confirm(message);

                if (!confirmed) {
                    modeCheckbox.checked = settings.enabled;
                    return;
                }
            }

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

    if (isSupportedStandingsPage(contestPage)) {
        const standingsData = getStandingsData();

        if (standingsData === null) {
            console.warn("[QOJ CCPC Enhancer] 榜单数据缺失或格式不正确");
        } else {
            console.info(
                `[QOJ CCPC Enhancer] 已读取 ${standingsData.standings.length} 支队伍、${standingsData.problems.length} 道题`,
            );
        }
    }
}
