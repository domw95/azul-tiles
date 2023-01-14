// Test to check that the different AI all produce the same evaluation at a certain depth
import { AI, AIMode, AIOpts, PruningType, GameState, compareMoves, Move } from "../dist/index.js";

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

opts.pruning = PruningType.ALPHA_BETA;

players.push(new AI(0, opts));

while (true) {
    player.id = game.activePlayer;
    const move = player.getMove(game) as Move;
    for (const other of players) {
        other.id = game.activePlayer;
        if (!compareMoves(other.getMove(game) as Move, move)) {
            Error("Wrong move from " + JSON.stringify(other));
        }
        game.playMove(move);
        if (!game.nextTurn()) {
            break;
        }
    }
}
