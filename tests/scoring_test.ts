import { SearchExit } from "minimaxer";
import { AI, AIOpts, GameState, SearchMethod } from "../dist/index.js";
import { wallScore } from "../dist/playerboard.js";

test("Game scoring", () => {
    // Create a new game
    for (let i = 0; i < 100; i++) {
        const gs = new GameState();
        gs.newGame(2);

        let round_score = [0, 0];
        const total_score = [0, 0];
        // Go through entire game
        for (;;) {
            // Get move
            const move = gs.availableMoves[Math.floor(Math.random() * gs.availableMoves.length)];
            // Play move and get score
            round_score[gs.activePlayer] += gs.playMove(move);

            // Check bonus score
            gs.playerBoards.forEach((pb) => {
                expect(pb.bonusScore).toBe(wallScore(pb.shadowWall));
            });

            if (!gs.nextTurn()) {
                // End of round, validate scores
                round_score.forEach((score, i) => {
                    expect(score).toBe(gs.playerBoards[i].roundScore);
                    total_score[i] = Math.max(0, total_score[i] + score);
                });
                round_score = [0, 0];
                if (!gs.endRound()) {
                    break;
                } else {
                    // Check scores on none end game round
                    total_score.forEach((score, i) => {
                        if (score != gs.playerBoards[i].score) {
                            console.log(JSON.stringify(gs, null, 2));
                        }
                        expect(score).toBe(gs.playerBoards[i].score);
                    });
                }
            }
        }
    }
});

test("Player prediction", () => {
    const gs = new GameState();
    gs.newGame(2);
    const opts = new AIOpts();
    opts.method = SearchMethod.TIME;
    opts.timeout = 100;
    opts.optimal = true;

    let minimums: number[] = [];
    let maximums: number[] = [];

    for (;;) {
        // Get move
        const player = new AI(gs.activePlayer, opts);
        const move = player.getMove(gs);
        if (player.result?.exit == SearchExit.FULL_DEPTH) {
            if (player.id == 0) {
                minimums.push(player.result.value);
            } else {
                maximums.push(player.result.value);
            }
        }
        // Play move
        if (move != undefined) {
            gs.playMove(move);
        }

        const bonus = gs.playerBoards[gs.previousPlayer].bonusScore;

        const bestChild = player.tree?.root.child;
        if (bestChild != undefined) {
            expect(bestChild.gamestate.playerBoards[gs.previousPlayer].bonusScore).toBe(bonus);
        }

        if (!gs.nextTurn()) {
            // End of round
            if (!gs.endRound()) {
                // console.log("End of game");
                // gs.playerBoards.forEach((pb) => console.log(pb));
                // console.log("min", minimums);
                // console.log("max", maximums);
                const round_diff = gs.playerBoards[0].score - gs.playerBoards[1].score;
                minimums.forEach((x) => expect(round_diff).toBeGreaterThanOrEqual(x));
                maximums.forEach((x) => expect(round_diff).toBeLessThanOrEqual(x));

                maximums = [];
                minimums = [];
                break;
            } else {
                console.log("min", minimums);
                console.log("max", maximums);
                const scores = gs.playerBoards.map((pb) => {
                    return pb.score + pb.bonusScore;
                });
                const round_diff = scores[0] - scores[1];
                minimums.forEach((x) => expect(round_diff).toBeGreaterThanOrEqual(x));
                maximums.forEach((x) => expect(round_diff).toBeLessThanOrEqual(x));
                maximums = [];
                minimums = [];
            }
        }
    }
    // console.log(gs.winner);
    // console.log(gs.playerBoards.map((pb) => pb.score));
});
