import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { loadContestSettings, loadSettingsEditorState, saveSettingsEditorState } from "../src/settings.js";

const defaults = { enabled: true, need: null, percentage: 20 };
const fallbackSettings = { enabled: false, need: null, percentage: 20 };
const globalSettings = { enabled: true, need: null, percentage: 12.5 };
const contestSettings = { enabled: false, need: 7, percentage: null };
const legacyKey = (id) => `qoj-ccpc-enhancer:contest:${id}`;

function createStorage(entries = []) {
    const values = new Map(entries);
    const state = { values, writes: [], failRead: false, failWrite: false };

    globalThis.window = {
        localStorage: {
            getItem(key) {
                if (state.failRead) {
                    throw new Error("storage read denied");
                }

                return values.get(key) ?? null;
            },
            setItem(key, value) {
                if (state.failWrite) {
                    throw new Error("storage write denied");
                }

                values.set(key, value);
                state.writes.push({ key, value });
            },
        },
    };

    return state;
}

function withoutWarnings(action) {
    const warn = console.warn;
    console.warn = () => {};

    try {
        return action();
    } finally {
        console.warn = warn;
    }
}

afterEach(() => {
    delete globalThis.window;
});

test("new contests follow enabled global defaults without writing storage", () => {
    const storage = createStorage();

    assert.deepEqual(loadSettingsEditorState(1), {
        source: "global",
        globalSettings: defaults,
        contestSettings: null,
    });
    assert.deepEqual(loadContestSettings(1), defaults);
    assert.equal(storage.writes.length, 0);
    assert.equal(storage.values.size, 0);
});

test("legacy contest settings remain dedicated and keep the original record", () => {
    const legacy = JSON.stringify(contestSettings);
    const storage = createStorage([[legacyKey(1), legacy]]);

    assert.deepEqual(loadSettingsEditorState(1), {
        source: "contest",
        globalSettings: defaults,
        contestSettings,
    });
    assert.deepEqual(loadContestSettings(1), contestSettings);
    assert.equal(storage.values.get(legacyKey(1)), legacy);
    assert.equal(storage.writes.length, 0);
});

test("legacy settings missing percentage retain the previous 20 percent behavior", () => {
    createStorage([[legacyKey(1), JSON.stringify({ enabled: true, need: 50 })]]);

    assert.deepEqual(loadContestSettings(1), { enabled: true, need: 50, percentage: 20 });
});

test("global changes apply to new contests while legacy contests stay independent", () => {
    createStorage([[legacyKey(2), JSON.stringify(contestSettings)]]);

    assert.deepEqual(saveSettingsEditorState(1, { source: "global", globalSettings }), globalSettings);
    assert.deepEqual(loadContestSettings(3), globalSettings);
    assert.deepEqual(loadContestSettings(2), contestSettings);
    assert.equal(loadSettingsEditorState(3).source, "global");
});

test("both scopes and the selected source are committed with a single write", () => {
    const storage = createStorage();

    assert.deepEqual(saveSettingsEditorState(1, {
        source: "contest",
        globalSettings,
        contestSettings,
    }), contestSettings);
    assert.deepEqual(loadSettingsEditorState(1), { source: "contest", globalSettings, contestSettings });
    assert.deepEqual(loadContestSettings(2), globalSettings);
    assert.equal(storage.writes.length, 1);
});

test("switching back to global retains the dedicated contest parameters", () => {
    createStorage();
    saveSettingsEditorState(1, { source: "contest", globalSettings, contestSettings });

    assert.deepEqual(saveSettingsEditorState(1, { source: "global" }), globalSettings);
    assert.deepEqual(loadSettingsEditorState(1).contestSettings, contestSettings);
    assert.deepEqual(saveSettingsEditorState(1, { source: "contest" }), contestSettings);
});

test("saving global changes while using dedicated settings leaves the current contest independent", () => {
    createStorage();
    saveSettingsEditorState(1, { source: "contest", contestSettings });

    assert.deepEqual(saveSettingsEditorState(1, { source: "contest", globalSettings }), contestSettings);
    assert.deepEqual(loadContestSettings(2), globalSettings);
});

test("unchanged global settings are read at save time instead of overwritten by an old editor snapshot", () => {
    createStorage();
    const oldEditor = loadSettingsEditorState(1);
    saveSettingsEditorState(2, { source: "global", globalSettings });

    assert.deepEqual(oldEditor.globalSettings, defaults);
    saveSettingsEditorState(1, { source: "contest", contestSettings });

    assert.deepEqual(loadSettingsEditorState(1).globalSettings, globalSettings);
    assert.deepEqual(loadContestSettings(3), globalSettings);
});

test("saving a different contest preserves existing dedicated settings", () => {
    createStorage();
    saveSettingsEditorState(1, { source: "contest", contestSettings });
    const second = { enabled: true, need: 99, percentage: 100 };
    saveSettingsEditorState(2, { source: "contest", contestSettings: second });

    assert.deepEqual(loadContestSettings(1), contestSettings);
    assert.deepEqual(loadContestSettings(2), second);
});

test("switching a legacy contest to global keeps its dedicated snapshot available", () => {
    const legacy = JSON.stringify(contestSettings);
    const storage = createStorage([[legacyKey(1), legacy]]);

    saveSettingsEditorState(1, { source: "global", globalSettings });

    assert.deepEqual(loadSettingsEditorState(1), { source: "global", globalSettings, contestSettings });
    assert.equal(storage.values.get(legacyKey(1)), legacy);
    assert.notEqual(storage.writes[0].key, legacyKey(1));
    assert.deepEqual(saveSettingsEditorState(1, { source: "contest" }), contestSettings);
});

test("null reveal conditions stay disabled and do not mean inheritance", () => {
    createStorage();
    const dedicated = { enabled: false, need: null, percentage: null };
    saveSettingsEditorState(1, { source: "contest", globalSettings, contestSettings: dedicated });

    assert.deepEqual(loadContestSettings(1), dedicated);
    assert.deepEqual(loadContestSettings(2), globalSettings);
});

test("dedicated source requires a complete dedicated configuration", () => {
    const storage = createStorage();

    assert.throws(() => saveSettingsEditorState(1, { source: "contest" }), TypeError);
    assert.equal(storage.writes.length, 0);
});

test("invalid source and parameter values never write storage", () => {
    const storage = createStorage();
    const invalidChanges = [
        { source: "other" },
        { source: "global", globalSettings: { ...defaults, enabled: 1 } },
        { source: "global", globalSettings: { ...defaults, need: 0 } },
        { source: "global", globalSettings: { ...defaults, need: 1.5 } },
        { source: "global", globalSettings: { ...defaults, percentage: 0 } },
        { source: "global", globalSettings: { ...defaults, percentage: 100.1 } },
        { source: "global", globalSettings: { ...defaults, percentage: "20" } },
        { source: "global", globalSettings: { ...defaults, percentage: NaN } },
        { source: "global", globalSettings: { ...defaults, percentage: Infinity } },
        { source: "contest", contestSettings: null },
    ];

    for (const changes of invalidChanges) {
        assert.throws(() => saveSettingsEditorState(1, changes));
    }

    assert.equal(storage.values.size, 0);
    assert.equal(storage.writes.length, 0);
});

test("write failure preserves both scopes and the selected source", () => {
    const storage = createStorage();
    saveSettingsEditorState(1, { source: "contest", globalSettings, contestSettings });
    const before = new Map(storage.values);
    const changes = {
        source: "global",
        globalSettings: { enabled: false, need: 2, percentage: 50 },
        contestSettings: { enabled: true, need: null, percentage: null },
    };
    storage.failWrite = true;

    assert.throws(() => saveSettingsEditorState(1, changes), /storage write denied/);
    assert.deepEqual(storage.values, before);
    assert.deepEqual(loadSettingsEditorState(1), { source: "contest", globalSettings, contestSettings });

    storage.failWrite = false;
    assert.deepEqual(saveSettingsEditorState(1, changes), changes.globalSettings);
    assert.equal(storage.writes.length, 2);
});

test("malformed shared storage is not overwritten by saving a fallback state", () => {
    const storage = createStorage();
    saveSettingsEditorState(1, { source: "global", globalSettings });
    const storeKey = storage.writes[0].key;
    storage.values.set(storeKey, "{");

    assert.deepEqual(withoutWarnings(() => loadContestSettings(1)), fallbackSettings);
    assert.throws(() => saveSettingsEditorState(1, { source: "global" }), SyntaxError);
    assert.equal(storage.values.get(storeKey), "{");
    assert.equal(storage.writes.length, 1);
});

test("read failure falls back for display but prevents saving over unreadable data", () => {
    const storage = createStorage();
    storage.failRead = true;

    assert.deepEqual(withoutWarnings(() => loadContestSettings(1)), fallbackSettings);
    assert.throws(() => saveSettingsEditorState(1, { source: "global" }), /storage read denied/);
    assert.equal(storage.writes.length, 0);
});

test("malformed legacy settings remain dedicated and can be superseded safely", () => {
    const storage = createStorage([[legacyKey(1), "{"]]);

    assert.deepEqual(withoutWarnings(() => loadSettingsEditorState(1)), {
        source: "contest",
        globalSettings: defaults,
        contestSettings: fallbackSettings,
    });
    withoutWarnings(() => saveSettingsEditorState(1, { source: "global", globalSettings }));

    assert.deepEqual(loadContestSettings(1), globalSettings);
    assert.deepEqual(loadSettingsEditorState(1).contestSettings, fallbackSettings);
    assert.equal(storage.values.get(legacyKey(1)), "{");
});

test("loaded snapshots cannot mutate saved or inherited configurations", () => {
    createStorage();
    saveSettingsEditorState(1, { source: "contest", globalSettings, contestSettings });
    const state = loadSettingsEditorState(1);
    state.globalSettings.percentage = 80;
    state.contestSettings.need = 80;

    assert.deepEqual(loadContestSettings(1), contestSettings);
    assert.deepEqual(loadContestSettings(2), globalSettings);
});

test("explicitly saved global opt-out remains disabled after source changes", () => {
    createStorage();
    const disabledGlobal = { ...defaults, enabled: false };
    saveSettingsEditorState(1, { source: "global", globalSettings: disabledGlobal });

    assert.deepEqual(loadContestSettings(2), disabledGlobal);
    saveSettingsEditorState(1, { source: "contest", contestSettings: globalSettings });
    assert.deepEqual(saveSettingsEditorState(1, { source: "global" }), disabledGlobal);
    assert.deepEqual(loadSettingsEditorState(2).globalSettings, disabledGlobal);
});

test("missing global enabled uses the enabled default while legacy records keep their old default", () => {
    const storage = createStorage([[legacyKey(2), JSON.stringify({ need: 50 })]]);
    saveSettingsEditorState(1, { source: "global" });
    const storeKey = storage.writes[0].key;
    const stored = JSON.parse(storage.values.get(storeKey));
    delete stored.globalSettings.enabled;
    storage.values.set(storeKey, JSON.stringify(stored));

    assert.deepEqual(loadContestSettings(1), defaults);
    assert.deepEqual(loadContestSettings(2), { enabled: false, need: 50, percentage: 20 });

    delete stored.globalSettings;
    storage.values.set(storeKey, JSON.stringify(stored));

    assert.deepEqual(loadContestSettings(3), defaults);
    assert.deepEqual(loadContestSettings(2), { enabled: false, need: 50, percentage: 20 });
});
