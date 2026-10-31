function getSettingsKey(id) {
    return `qoj-ccpc-enhancer:contest:${id}`;
}

function normalizeSettings(settings) {
    const need = settings?.need;
    const validNeed = need === null || (Number.isSafeInteger(need) && need > 0);

    return {
        enabled: settings?.enabled === true,
        need: validNeed ? need : null,
    };
}

export function loadContestSettings(id) {
    try {
        const storedValue = window.localStorage.getItem(getSettingsKey(id));

        if (storedValue !== null) {
            return normalizeSettings(JSON.parse(storedValue));
        }
    } catch (error) {
        console.warn("[QOJ CCPC Enhancer] 读取比赛设置失败，使用默认设置", error);
    }

    return normalizeSettings(null);
}

export function saveContestSettings(id, settings) {
    window.localStorage.setItem(
        getSettingsKey(id),
        JSON.stringify(normalizeSettings(settings)),
    );
}
