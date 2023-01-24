import { PruningType, SearchMethod } from "minimaxer";
import { AI, AIOpts, CloneMethod, GameState, Move } from "../dist/index.js";

// Create a game
const game = new GameState();
game.newGame(2);
const opts = new AIOpts();
opts.method = SearchMethod.TIME;
opts.presort = true;
opts.pruning = PruningType.ALPHA_BETA;
opts.timeout = 100;
opts.clone = CloneMethod.SMART;
const player = new AI(0, opts);

for (let i = 0; ; i++) {
    player.id = game.activePlayer;

    const move = player.getMove(game) as Move;
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
