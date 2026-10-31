export function getStandingsData() {
    const { standings, score, problems, problems_id: problemLabels } = window;

    if (
        !Array.isArray(standings) ||
        score === null ||
        typeof score !== "object" ||
        Array.isArray(score) ||
        !Array.isArray(problems) ||
        !Array.isArray(problemLabels)
    ) {
        return null;
    }

    return {
        standings, score, problems, problemLabels,
        myName: window.my_name,
        external: Boolean(window.external),
        finalized: Boolean(window.finalized),
        showMedals: Boolean(window.show_medals),
        version: window.standings_version,
    };
}
