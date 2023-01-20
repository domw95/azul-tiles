import { SearchMethod } from "minimaxer";
import { AI, GameState, AIOpts, PruningType } from "../dist/index.js";

// Create a game
const game = new GameState();
game.newGame(2);

for (let i = 0; ; i++) {
    const move = game.availableMoves[0];
    console.log("move", move);
    game.playMove(move);
    if (!game.nextTurn()) {
        console.log();
        console.log("=========== End of round ==========");
        console.log([
            ...game.playerBoards.map((pb) => {
                return pb.score;
            }),
        ]);
        console.log();
        if (!game.endRound()) {
            console.log();
            console.log("========== End of game ===========");
            console.log();
            break;
        }
    }
}

// printGame(game);
console.log(game.winner);
console.log([
    ...game.playerBoards.map((pb) => {
        return pb.score;
    }),
]);
