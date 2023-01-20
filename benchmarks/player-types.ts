/* eslint-disable @typescript-eslint/no-unsafe-call */
import { add, complete, cycle, save, suite } from "benny";
import { SearchMethod } from "minimaxer";
import { AI, AIOpts, EvalMethod, GameState } from "../dist/index.js";

// Time how long it takes to evaluate a start position to depth 3

function firstMove(opts: AIOpts): void {
    // Create game and tree
    const game = new GameState();
    game.newGame(2);
    game.playMove(game.availableMoves[0]);
    game.nextTurn();
    game.playMove(game.availableMoves[0]);
    game.nextTurn();
    opts.depth = 2;
    opts.method = SearchMethod.DEEPENING;
    const player = new AI(1, opts);
    player.getMove(game);
}

void suite(
    "Player comparison",

    add("Standard settings", () => {
        const opts = new AIOpts();
        opts.optimal = true;
        firstMove(opts);
    }),
    add("General player", () => {
        const opts = new AIOpts();
        opts.optimal = true;
        opts.eval = EvalMethod.GENERAL;
        firstMove(opts);
    }),

    cycle(),

    complete(),

    // save({
    //     file: "negamax_unify_" + depth.toString() + "_depth",
    //     folder: "benchmarks/results",
    // }),
);
