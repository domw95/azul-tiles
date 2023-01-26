import { AI, GameState, AIOpts } from "../dist/index.js";
// Create a game
const game = new GameState();
game.newGame(2);
const opts = new AIOpts();
opts.timeout = 100;
// opts0.print = true;
opts.method = 3 /* SearchMethod.TIME */;
// opts0.pruning = PruningType.ALPHA_BETA;
// opts0.presort = true;
// opts0.genBased = true;
const player = new AI(0, opts);
for (let i = 0;; i++) {
    player.id = i % 2;
    const move = player.getMove(game);
    if (move != undefined) {
        game.playMove(move);
        if (!game.nextTurn()) {
            if (!game.endRound()) {
                break;
            }
        }
    }
    else {
        throw Error("Move undefined");
    }
}
// printGame(game);
console.log(game.winner);
console.log([
    ...game.playerBoards.map((pb) => {
        return pb.score;
    }),
]);
