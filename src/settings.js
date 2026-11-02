import { defaultRevealPercentage, isValidRevealPercentage } from "./domain/problems.js";

const settingsStoreKey = "qoj-ccpc-enhancer:settings";

function getSettingsKey(id) {
    return `qoj-ccpc-enhancer:contest:${id}`;
}

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeSettings(settings, enabledByDefault = false) {
    const need = settings?.need;
    const validNeed = need === null || (Number.isSafeInteger(need) && need > 0);
    const percentage = settings?.percentage;
    const validPercentage = percentage === null || isValidRevealPercentage(percentage);

    return {
        enabled: settings?.enabled === undefined ? enabledByDefault : settings.enabled === true,
        need: validNeed ? need : null,
        percentage: validPercentage ? percentage : defaultRevealPercentage,
    };
}

function readSettingsStore() {
    const storedValue = window.localStorage.getItem(settingsStoreKey);

    if (storedValue === null) {
        return { globalSettings: normalizeSettings(null, true), contests: {} };
    }

    const stored = JSON.parse(storedValue);

    if (!isRecord(stored) || (stored.contests !== undefined && !isRecord(stored.contests))) {
        throw new TypeError("设置存储格式不正确");
    }

    return {
        globalSettings: normalizeSettings(stored.globalSettings, true),
        contests: stored.contests ?? {},
    };
}

function getEditorState(store, id) {
    const record = store.contests[id];

    if (isRecord(record)) {
        const source = record.source === "contest" ? "contest" : "global";
        const contestSettings = record.settings === null || record.settings === undefined
            ? source === "contest" ? normalizeSettings(null) : null
            : normalizeSettings(record.settings);

        return { source, globalSettings: { ...store.globalSettings }, contestSettings };
    }

    const legacyValue = window.localStorage.getItem(getSettingsKey(id));

    if (legacyValue === null) {
        return { source: "global", globalSettings: { ...store.globalSettings }, contestSettings: null };
    }

    let legacySettings;

    try {
        legacySettings = JSON.parse(legacyValue);
    } catch (error) {
        console.warn("[QOJ CCPC Enhancer] 旧比赛设置格式不正确，使用默认参数", error);
    }

    return {
        source: "contest",
        globalSettings: { ...store.globalSettings },
        contestSettings: normalizeSettings(legacySettings),
    };
}

function validateSettings(settings) {
    if (!isRecord(settings) || typeof settings.enabled !== "boolean") {
        throw new TypeError("启用开关必须为布尔值");
    }

    if (settings.need !== null && (!Number.isSafeInteger(settings.need) || settings.need <= 0)) {
        throw new RangeError("need 必须为正整数或 null");
    }

    if (settings.percentage !== null && !isValidRevealPercentage(settings.percentage)) {
        throw new RangeError("percentage 必须为大于 0 且不超过 100 的数字或 null");
    }

    return normalizeSettings(settings);
}

export function loadSettingsEditorState(id) {
    try {
        return getEditorState(readSettingsStore(), id);
    } catch (error) {
        console.warn("[QOJ CCPC Enhancer] 读取设置失败，使用默认设置", error);
        return { source: "global", globalSettings: normalizeSettings(null), contestSettings: null };
    }
}

export function loadContestSettings(id) {
    const state = loadSettingsEditorState(id);
    return state.source === "contest" ? state.contestSettings : state.globalSettings;
}

export function saveSettingsEditorState(id, updatedSettings) {
    if (!isRecord(updatedSettings) || !["global", "contest"].includes(updatedSettings.source)) {
        throw new RangeError("设置来源必须为 global 或 contest");
    }

    const store = readSettingsStore();
    const current = getEditorState(store, id);
    const globalSettings = updatedSettings.globalSettings === undefined
        ? store.globalSettings
        : validateSettings(updatedSettings.globalSettings);
    const contestSettings = updatedSettings.contestSettings === undefined
        ? current.contestSettings
        : validateSettings(updatedSettings.contestSettings);

    if (updatedSettings.source === "contest" && contestSettings === null) {
        throw new TypeError("当前比赛设置不能为空");
    }

    const updatedStore = {
        globalSettings,
        contests: {
            ...store.contests,
            [id]: { source: updatedSettings.source, settings: contestSettings },
        },
    };

    window.localStorage.setItem(settingsStoreKey, JSON.stringify(updatedStore));

    return { ...(updatedSettings.source === "contest" ? contestSettings : globalSettings) };
}
