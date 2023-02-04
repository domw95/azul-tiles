/* eslint-disable @typescript-eslint/no-unsafe-call */
import { add, complete, cycle, suite } from "benny";
import { SearchMethod } from "minimaxer";
import { AIOpts, GameState, MultiAI } from "../dist/index.js";

// Time how long it takes to evaluate a start position to depth 3

function firstMove(opts: AIOpts): void {
    // Create game and tree
    const game = new GameState();
    game.newGame(3);
    game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    game.nextTurn();
    game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    game.nextTurn();
    game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    game.nextTurn();
    game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    game.nextTurn();
    game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    game.nextTurn();
    game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    game.nextTurn();

    opts.depth = 3;
    opts.method = SearchMethod.DEEPENING;

    const player = new MultiAI(0, opts);
    player.getMove(game);
}

void suite(
    "Player comparison",

    add("Standard", () => {
        const opts = new AIOpts();
        firstMove(opts);
    }),
    add("Standard Quick", () => {
        const opts = new AIOpts();
        opts.config.quickEval = true;
        firstMove(opts);
    }),

    add("Centre", () => {
        const opts = new AIOpts();
        opts.config.centre = 0.1;
        opts.config.firstTileValue = 1.5;
        firstMove(opts);
    }),
    add("Centre quick", () => {
        const opts = new AIOpts();
        opts.config.centre = 0.1;
        opts.config.firstTileValue = 1.5;
        opts.config.quickEval = true;
        firstMove(opts);
    }),

    cycle(),

    complete(),

    // save({
    //     file: "negamax_unify_" + depth.toString() + "_depth",
    //     folder: "benchmarks/results",
    // }),
);
