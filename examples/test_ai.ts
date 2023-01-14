import { GameState, printGame } from "../dist/index.js";
import { AI, AIOpts } from "../dist/ai/players.js";
import { PruningType } from "minimaxer";

// Create a game
const game = new GameState();
game.newGame(2);

const opts0 = new AIOpts();
opts0.timeout = 100;
// opts0.pruning = PruningType.ALPHA_BETA;
// opts0.presort = true;
// opts0.genBased = true;
const player0 = new AI(0, opts0);

const opts1 = new AIOpts();
opts1.timeout = 100;
opts1.pruning = PruningType.ALPHA_BETA;
opts1.presort = true;
opts1.genBased = true;
const player1 = new AI(1, opts1);
const players = [player0, player1];

for (let i = 0; ; i++) {
    const move = players[game.activePlayer].getMove(game);
    console.log(move);
    if (move != undefined) {
        game.playMove(move);
        if (!game.nextTurn()) {
            console.log();
            console.log("=========== End of round ==========");
            console.log();
            if (!game.endRound()) {
                console.log();
                console.log("========== End of game ===========");
                console.log();
                break;
            }
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
