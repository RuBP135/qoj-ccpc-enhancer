import { getContestPageContext } from "./qoj/page.js";
import { mountModeCheckbox } from "./ui/mode-checkbox.js";

const contestPage = getContestPageContext();

if (contestPage !== null) {
    const modeCheckbox = mountModeCheckbox();

    if (modeCheckbox !== null) {
        console.info(`[QOJ CCPC Enhancer] 已初始化比赛 ${contestPage.id}`);
    }
}
