import { GameState } from "../dist/state.js";
import { add, complete, cycle, save, suite } from "benny";

const games = new Array(100).fill(new GameState()) as GameState[];
games.forEach((game) => {
    game.newGame(2);
    game.playMove(game.availableMoves[0]);
    game.nextTurn();
});

void suite(
    "Gamestate Clone",

    add("clone", () => {
        games.forEach((game) => {
            game.clone();
        });
    }),

    add("Smart clone", () => {
        games.forEach((game) => {
            game.smartClone(game.availableMoves[0]);
        });
    }),

    add("Tiny clone", () => {
        games.forEach((game) => {
            game.tinyClone(game.availableMoves[0]);
        });
    }),

    add("Tiny clone constructor", () => {
        games.forEach((game) => {
            new GameState(game, game.availableMoves[0]);
        });
    }),

    cycle(),

    complete(),

    // save({
    //     file: "negamax_unify_" + depth.toString() + "_depth",
    //     folder: "benchmarks/results",
    // }),
);
