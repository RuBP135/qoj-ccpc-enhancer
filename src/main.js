import { getContestPageContext, isStandingsPage, isSupportedStandingsPage } from "./data/page.js";
import { loadContestSettings, loadSettingsEditorState, saveSettingsEditorState } from "./settings.js";
import { createStandingsController } from "./standings-controller.js";
import { mountSettingsButton } from "./ui/settings-button.js";
import { createSettingsDialog } from "./ui/settings-dialog.js";
import { hideStandingsDuringInitialization } from "./ui/standings-loading.js";

const contestPage = getContestPageContext();

if (contestPage !== null) {
    const startupSettings = loadContestSettings(contestPage.id);
    let revealStandings = null;

    if (startupSettings.enabled && isStandingsPage(contestPage)) {
        try {
            revealStandings = hideStandingsDuringInitialization();
        } catch (error) {
            console.error("[QOJ CCPC Enhancer] 提前隐藏榜单失败", error);
        }
    }

    function initialize() {
        try {
            const settings = loadContestSettings(contestPage.id);
            const standingsController = isSupportedStandingsPage(contestPage)
                ? createStandingsController(contestPage, settings)
                : null;
            const settingsButton = mountSettingsButton();

            if (settingsButton !== null) {
                const settingsDialog = createSettingsDialog({
                    onSave(updatedSettings) {
                        const settings = saveSettingsEditorState(contestPage.id, updatedSettings);
                        standingsController?.updateSettings(settings);
                    },
                });

                settingsButton.addEventListener("click", () => {
                    settingsDialog.open(loadSettingsEditorState(contestPage.id));
                });

                console.info(`[QOJ CCPC Enhancer] 已初始化比赛 ${contestPage.id}`);
            }
        } catch (error) {
            console.error("[QOJ CCPC Enhancer] 初始化失败", error);
        } finally {
            revealStandings?.();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
}
