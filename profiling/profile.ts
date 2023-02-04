import { SearchMethod } from "minimaxer";
import { AI, GameState, AIOpts, PruningType } from "../dist/index.js";

// Create a game
const game = new GameState();
game.newGame(2);

const opts = new AIOpts();
opts.timeout = 10000;
opts.print = true;
opts.method = SearchMethod.TIME;
opts.pruning = PruningType.ALPHA_BETA;
opts.presort = true;
opts.genBased = true;
const player = new AI(0, opts);

const move = player.getMove(game);
console.log(move);

// for (let i = 0; ; i++) {
//     player.id = i % 2;
//     const move = player.getMove(game);
//     if (move != undefined) {
//         game.playMove(move);
//         if (!game.nextTurn()) {
//             if (!game.endRound()) {
//                 break;
//             }
//         }
//     } else {
//         throw Error("Move undefined");
//     }
// }

// // printGame(game);
// console.log(game.winner);
// console.log([
//     ...game.playerBoards.map((pb) => {
//         return pb.score;
//     }),
// ]);
