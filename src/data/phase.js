function parseDuration(text) {
    const match = text.match(/^(?:([0-9]+)\s+days\s+)?([0-9]+):([0-5][0-9]):([0-5][0-9])$/);

    if (match === null) {
        return null;
    }

    const seconds =
        Number(match[1] ?? 0) * 86400 +
        Number(match[2]) * 3600 +
        Number(match[3]) * 60 +
        Number(match[4]);

    return Number.isSafeInteger(seconds) ? seconds : null;
}

export function getContestPhase() {
    const statusCard = document.querySelector(".uoj-content .card.border-info");
    const title = (statusCard?.querySelector(".card-header")?.textContent ?? "").trim();

    if (title === "") {
        return null;
    }

    if (/^(比赛已结束|Contest ended)$/i.test(title)) {
        return "ended";
    }

    if (!/^(距离比赛结束|Contest ends in)$/i.test(title)) {
        return null;
    }

    const countdown = statusCard.querySelector(".countdown[data-rest]");

    if (countdown === null) {
        return null;
    }

    const currentText = countdown.textContent.trim();
    let remaining = parseDuration(currentText);

    if (currentText === "") {
        const rawRemaining = countdown.getAttribute("data-rest");
        remaining =
            rawRemaining !== null && /^[0-9]+$/.test(rawRemaining)
                ? Number(rawRemaining)
                : null;
    }

    if (!Number.isSafeInteger(remaining) || remaining < 0) {
        return null;
    }

    if (remaining === 0) {
        return "ended";
    }

    return remaining <= 3600 ? "frozen" : "running";
}
