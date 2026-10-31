export function getContestPageContext() {
    const match = window.location.pathname.match(/^\/contest\/(\d+)(?:\/([^/]+))?(?:\/.*)?$/);

    if (match === null) {
        return null;
    }

    const id = Number(match[1]);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    const kind = match[2] ?? "home";

    return { id, kind };
}

export function isSupportedStandingsPage(contestPage) {
    return (
        contestPage.kind === "standings" &&
        /^\/contest\/\d+\/standings\/?$/.test(window.location.pathname) &&
        window.contest_type === "ICPC" &&
        window.icpc_partial_scores === false
    );
}
