import { getProblemStates, isProblemSolved, sortHeaderProblems } from "../domain/problems.js";
import { sortTeamProblems } from "../domain/teams.js";

function escapeHtml(value) {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(value ?? "").replace(/[&<>"']/g, (character) => entities[character]);
}

function getProblemStatistics(standingsData, problemStates) {
    const statistics = problemStates.map(() => ({ attemptedCount: 0, firstAcceptedAt: null }));

    for (const row of standingsData.standings) {
        const scores = standingsData.score[row[2][0]];

        for (const problem of problemStates) {
            const record = scores?.[problem.index];

            if (record === undefined || record === null) {
                continue;
            }

            const statistic = statistics[problem.index];
            statistic.attemptedCount++;

            if (isProblemSolved(record) && Number.isFinite(record[1]) && record[1] >= 0) {
                statistic.firstAcceptedAt =
                    statistic.firstAcceptedAt === null
                        ? record[1]
                        : Math.min(statistic.firstAcceptedAt, record[1]);
            }
        }
    }

    return statistics;
}

function renderHeader(problemStates, context) {
    const problemHeaders = sortHeaderProblems(problemStates).map((problem) => {
        const label = escapeHtml(problem.revealed ? problem.label : "?");
        const linkAllowed = problem.revealed && !(context.external && !context.finalized);
        const heading = linkAllowed
            ? `<a href="/contest/${context.id}/problem/${encodeURIComponent(problem.id)}">${label}</a>`
            : label;
        const status = problem.passedCount > 0 ? "success" : "danger";
        const attemptedCount = context.statistics[problem.index].attemptedCount;

        return `<th class="table-${status}" style="width:5em"><div>${heading}</div><div style="font-size:75%">${problem.passedCount}/${attemptedCount}</div></th>`;
    }).join("");

    return `<tr><th style="width:3em">#</th><th style="width:${context.external ? 60 : 15}em">${escapeHtml(window.uojLocale("username"))}</th>${context.showMedals ? '<th style="width:4em">Medal</th>' : ""}<th style="width:4em">${escapeHtml(window.uojLocale("contests::total score"))}</th>${problemHeaders}</tr>`;
}

function renderTeamName(team) {
    const [username, rating, type, nickname, color, rated, school] = team;

    if (type === 0 || type === 1 || type === 2) {
        const link = window.getUserLink(username, rating, color, nickname, rated);

        if (type === 0) {
            const affiliation = school === undefined || school === null || school === ""
                ? ""
                : `<div style="font-size:75%"><b>${escapeHtml(school)}</b></div>`;
            return `${link}<br>${affiliation}`;
        }

        return `<b>*</b>${link}`;
    }

    return escapeHtml(nickname);
}

function renderProblemCell(problem, record, context) {
    if (record === undefined || record === null ||
        !Number.isSafeInteger(record[3]) || record[3] < 0) {
        return "<td></td>";
    }

    const statistic = context.statistics[problem.index];
    const solved = isProblemSolved(record);
    const hacked = solved && record[0] === 97;
    const firstAccepted = solved && !hacked && record[1] === statistic.firstAcceptedAt;
    const cellClass = hacked ? ' class="table-danger"' : firstAccepted ? ' class="table-success"' : "";
    const attempts = record[3];
    const unknown = record[5] === 1;
    let result;
    let color;

    if (unknown) {
        result = `?${attempts + 1}`;
        color = "blue";
    } else if (solved) {
        result = attempts > 0 ? `+${attempts}` : "+";
        color = hacked ? "rgb(204, 0, 0)" : "rgb(0, 204, 0)";
    } else {
        result = `-${attempts + 1}`;
        color = window.getColOfScore(0, 1);
    }

    const linkAllowed = problem.revealed && Number.isSafeInteger(record[2]) && record[2] > 0;
    const tag = linkAllowed ? "a" : "span";
    const href = linkAllowed ? ` href="/submission/${record[2]}"` : "";
    const assigned = solved ? ' data-assigned="1"' : "";
    const score = `<${tag}${href} class="uoj-score" data-max="${attempts}"${assigned} style="color:${escapeHtml(color)}">${escapeHtml(result)}</${tag}>`;
    const showTime = Number.isFinite(record[1]) && record[1] >= 0 &&
        (context.version < 2 || (solved && !unknown));
    const time = showTime ? `<div>${escapeHtml(window.getPenaltyTimeStr(record[1]))}</div>` : "";

    return `<td${cellClass}><div>${score}</div>${time}</td>`;
}

function renderTeamRow(row, problemStates, context) {
    const team = row[2];
    const scores = context.score[team[0]] ?? {};
    const orderedProblems = sortTeamProblems(problemStates, scores, { isImported: team[2] === 3 });
    const acceptedCount = problemStates.filter((problem) => isProblemSolved(scores[problem.index])).length;
    const rowClass = context.myName === team[0]
        ? ' class="table-warning"'
        : context.external && ![0, 1, 3].includes(team[2]) ? ' class="table-info"' : "";
    const medal = context.showMedals
        ? `<td>${window.getMedalHTML(window.getMedalType(row[3]))}</td>`
        : "";
    const color = window.getColOfScore(acceptedCount / Math.max(problemStates.length, 1), 1);
    const total = `<td><div><span class="uoj-score" data-max="${problemStates.length}" style="color:${escapeHtml(color)}">${acceptedCount}</span></div><div>${escapeHtml(window.getPenaltyTimeStr(row[1]))}</div></td>`;
    const cells = orderedProblems.map((problem) =>
        renderProblemCell(problem, scores[problem.index], context),
    ).join("");

    return `<tr${rowClass}><td>${escapeHtml(row[3])}</td><td>${renderTeamName(team)}</td>${medal}${total}${cells}</tr>`;
}

export function renderCcpcStandings(contestPage, standingsData, settings) {
    const helpers = ["uojLocale", "getUserLink", "getColOfScore", "getPenaltyTimeStr"];

    if (standingsData.showMedals) {
        helpers.push("getMedalType", "getMedalHTML");
    }

    if (typeof window.jQuery?.fn?.long_table !== "function" ||
        helpers.some((name) => typeof window[name] !== "function")) {
        throw new Error("QOJ 表格组件或格式化方法不可用");
    }

    const table = window.jQuery("#standings");

    if (table.length === 0) {
        throw new Error("QOJ 榜单容器不存在");
    }

    const problemStates = getProblemStates(standingsData, { need: settings.need });
    const context = {
        ...standingsData,
        id: contestPage.id,
        statistics: getProblemStatistics(standingsData, problemStates),
    };
    const header = renderHeader(problemStates, context);
    const rows = standingsData.standings.map((row) => renderTeamRow(row, problemStates, context));

    table.long_table(rows, 1, header, (row) => row, {
        table_classes: [
            "table", "table-bordered", "table-striped",
            "table-text-center", "table-vertical-middle", "table-condensed",
        ],
        page_len: 100,
        print_after_table: () => `<div class="text-right text-muted">${escapeHtml(window.uojLocale("contests::n participants", rows.length))}</div>`,
    });
}
