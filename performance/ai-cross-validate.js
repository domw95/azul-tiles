import { AI, AIOpts, GameState, compareMoves } from "../dist/index.js";
// Create a new game
const game = new GameState();
game.newGame(2);
// Create a standard player
let opts = new AIOpts();
opts.timeout = 1000;
opts.print = true;
opts.method = 3 /* SearchMethod.TIME */;
const player = new AI(0, opts);
const players = [];
opts = structuredClone(opts);
opts.pruning = 1 /* PruningType.ALPHA_BETA */;
opts.optimal = true;
players.push(new AI(0, opts));
for (;;) {
    player.id = game.activePlayer;
    const move = player.getMove(game);
    for (const other of players) {
        other.id = game.activePlayer;
        if (!compareMoves(other.getMove(game), move)) {
            Error("Wrong move from " + JSON.stringify(other));
        }
    }
    game.playMove(move);
    if (!game.nextTurn()) {
        break;
    }
}
