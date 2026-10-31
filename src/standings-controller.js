import { getContestPhase } from "./data/phase.js";
import { getStandingsData } from "./data/standings.js";
import { renderCcpcStandings } from "./ui/standings-table.js";

export function createStandingsController(contestPage, initialSettings) {
    if (document.querySelector("#standings") === null || typeof window.showStandings !== "function") {
        console.warn("[QOJ CCPC Enhancer] QOJ 原榜或榜单容器不可用");
        return null;
    }

    const showOriginal = window.showStandings.bind(window);
    let settings = initialSettings;
    let lastPhase;
    let applied = false;

    function restoreOriginal() {
        try {
            showOriginal();
            applied = false;
        } catch (error) {
            console.error("[QOJ CCPC Enhancer] 恢复原榜失败", error);
        }
    }

    function refresh() {
        lastPhase = getContestPhase();

        if (!settings.enabled || lastPhase !== "running") {
            if (applied) {
                restoreOriginal();
            }

            if (settings.enabled && lastPhase === null) {
                console.warn("[QOJ CCPC Enhancer] 无法识别比赛阶段，保留原榜");
            }

            return;
        }

        const standingsData = getStandingsData();

        if (standingsData === null) {
            console.warn("[QOJ CCPC Enhancer] 榜单数据缺失或格式不正确");

            if (applied) {
                restoreOriginal();
            }

            return;
        }

        try {
            renderCcpcStandings(contestPage, standingsData, settings);
            applied = true;
        } catch (error) {
            console.error("[QOJ CCPC Enhancer] 渲染 CCPC 榜单失败", error);
            restoreOriginal();
        }
    }

    const statusCard = document.querySelector(".uoj-content .card.border-info");

    if (statusCard !== null) {
        const observer = new window.MutationObserver(() => {
            if (getContestPhase() !== lastPhase) {
                refresh();
            }
        });
        observer.observe(statusCard, { childList: true, characterData: true, subtree: true });
    }

    refresh();

    return {
        updateSettings(updatedSettings) {
            settings = updatedSettings;
            refresh();
        },
    };
}
