import { isProblemSolved } from "./problems.js";

export function sortTeamProblems(problemStates, teamScores = {}, { isImported = false } = {}) {
    return [...problemStates].sort((left, right) => {
        const problemOrder = left.index - right.index;

        if (left.revealed !== right.revealed) {
            return left.revealed ? -1 : 1;
        }

        if (left.revealed) {
            return problemOrder;
        }

        const leftScore = teamScores?.[left.index] ?? undefined;
        const rightScore = teamScores?.[right.index] ?? undefined;
        const leftSolved = isProblemSolved(leftScore);
        const rightSolved = isProblemSolved(rightScore);

        if (leftSolved !== rightSolved) {
            return leftSolved ? -1 : 1;
        }

        if (leftSolved) {
            return leftScore[1] - rightScore[1] || problemOrder;
        }

        if (isImported) {
            return problemOrder;
        }

        if (leftScore === undefined || rightScore === undefined) {
            if (leftScore === rightScore) {
                return problemOrder;
            }

            return leftScore === undefined ? 1 : -1;
        }

        return leftScore[2] - rightScore[2] || problemOrder;
    });
}
