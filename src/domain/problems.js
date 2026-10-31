export function isProblemSolved(problemScore) {
    const score = problemScore?.[0];
    const maxScore = problemScore?.[4];

    if (!Number.isFinite(score) || !Number.isFinite(maxScore)) {
        return false;
    }

    return score === maxScore || score === 97;
}

export function getProblemStates(standingsData, { need = null } = {}) {
    if (need !== null && (!Number.isSafeInteger(need) || need <= 0)) {
        throw new RangeError("need 必须为正整数或 null");
    }

    const { standings, score, problems, problemLabels } = standingsData;
    const ratioThreshold = Math.floor(standings.length / 5);

    return problems.map((id, index) => {
        const passedCount = standings.reduce((count, row) => {
            const problemScore = score[row[2][0]]?.[index];
            return count + (isProblemSolved(problemScore) ? 1 : 0);
        }, 0);

        return {
            index,
            id,
            label: problemLabels[index] ?? "N/A",
            passedCount,
            revealed:
                (need !== null && passedCount >= need) ||
                passedCount >= ratioThreshold,
        };
    });
}

export function sortHeaderProblems(problemStates) {
    return [...problemStates].sort((left, right) => {
        if (left.revealed !== right.revealed) {
            return left.revealed ? -1 : 1;
        }

        if (!left.revealed && left.passedCount !== right.passedCount) {
            return right.passedCount - left.passedCount;
        }

        // index 对应 QOJ 原榜的题号顺序。
        return left.index - right.index;
    });
}
