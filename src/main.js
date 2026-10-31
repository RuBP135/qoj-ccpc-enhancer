import { getContestPageContext, isSupportedStandingsPage } from "./qoj/page.js";
import { getStandingsData } from "./qoj/standings.js";
import { loadContestSettings, saveContestSettings } from "./settings.js";
import { mountSettingsButton } from "./ui/settings-button.js";
import { createSettingsDialog } from "./ui/settings-dialog.js";

const contestPage = getContestPageContext();

if (contestPage !== null) {
    const settingsButton = mountSettingsButton();

    if (settingsButton !== null) {
        const settingsDialog = createSettingsDialog({
            onSave(settings) {
                saveContestSettings(contestPage.id, settings);
            },
        });

        settingsButton.addEventListener("click", () => {
            settingsDialog.open(loadContestSettings(contestPage.id));
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
