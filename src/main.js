import { getContestPageContext, isSupportedStandingsPage } from "./data/page.js";
import { loadContestSettings, saveContestSettings } from "./settings.js";
import { createStandingsController } from "./standings-controller.js";
import { mountSettingsButton } from "./ui/settings-button.js";
import { createSettingsDialog } from "./ui/settings-dialog.js";

const contestPage = getContestPageContext();

if (contestPage !== null) {
    const settings = loadContestSettings(contestPage.id);
    const standingsController = isSupportedStandingsPage(contestPage)
        ? createStandingsController(contestPage, settings)
        : null;
    const settingsButton = mountSettingsButton();

    if (settingsButton !== null) {
        const settingsDialog = createSettingsDialog({
            onSave(updatedSettings) {
                saveContestSettings(contestPage.id, updatedSettings);
                standingsController?.updateSettings(updatedSettings);
            },
        });

        settingsButton.addEventListener("click", () => {
            settingsDialog.open(loadContestSettings(contestPage.id));
        });

        console.info(`[QOJ CCPC Enhancer] 已初始化比赛 ${contestPage.id}`);
    }
}
