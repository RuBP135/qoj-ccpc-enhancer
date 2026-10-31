export function getProblemStates(standingsData, { need = null, isFrozen = false } = {}) {
    if (need !== null && (!Number.isInteger(need) || need <= 0)) {
        throw new RangeError("need 必须为正整数或 null");
    }

    const { standings, score, problems, problemLabels } = standingsData;
    const ratioThreshold = Math.floor(standings.length / 5);

    return problems.map((id, index) => {
        const passedCount = standings.reduce((count, row) => {
            const problemScore = score[row[2][0]]?.[index];
            const solved =
                problemScore !== undefined &&
                (problemScore[0] === problemScore[4] || problemScore[0] === 97);

            return count + (solved ? 1 : 0);
        }, 0);

        return {
            index,
            id,
            label: problemLabels[index] ?? String.fromCharCode("A".charCodeAt(0) + index),
            passedCount,
            revealed:
                isFrozen ||
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
            return left.passedCount - right.passedCount;
        }

        // index 对应 QOJ 原榜的题号顺序。
        return left.index - right.index;
    });
}
