function getSettingsKey(id) {
    return `qoj-ccpc-enhancer:contest:${id}`;
}

export function loadContestSettings(id) {
    try {
        const storedValue = window.localStorage.getItem(getSettingsKey(id));

        if (storedValue !== null) {
            const storedSettings = JSON.parse(storedValue);

            return { enabled: storedSettings?.enabled === true };
        }
    } catch (error) {
        console.warn("[QOJ CCPC Enhancer] 读取比赛设置失败，使用默认设置", error);
    }

    return { enabled: false };
}

export function saveContestSettings(id, settings) {
    window.localStorage.setItem(
        getSettingsKey(id),
        JSON.stringify({ enabled: settings.enabled === true }),
    );
}
