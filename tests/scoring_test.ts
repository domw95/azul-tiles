import { GameState, printGame, Tile } from "../dist/index.js";
import { State } from "../dist/state.js";

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
