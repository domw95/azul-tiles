// Test to check that the different AI all produce the same evaluation at a certain depth
import { GameState } from "../src/state.js";
import { AI, AIMode, AIOpts } from "../src/ai/players.js";
import { compareMoves } from "../src/utils.js";
const seed = "random";
// Create a new game
const game = new GameState();
game.newGame(2);
// Create a standard player
let opts = new AIOpts();
opts.depth = 3;
opts.print = true;
opts.mode = AIMode.DEEPENING;
const player = new AI(0, opts);
const players = [];
opts.pruning = 1 /* PruningType.ALPHA_BETA */;
players.push(new AI(0, opts));
while (true) {
    player.id = game.activePlayer;
    const move = player.getMove(game);
    for (const other of players) {
        other.id = game.activePlayer;
        if (!compareMoves(other.getMove(game), move)) {
            Error("Wrong move from " + JSON.stringify(other));
        }
        game.playMove(move);
        if (!game.nextTurn()) {
            break;
        }
    }
}
