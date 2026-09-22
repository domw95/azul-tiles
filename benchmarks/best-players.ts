/* eslint-disable @typescript-eslint/no-unsafe-call */
import { add, complete, cycle, suite } from "benny";
import { PruningType, SearchMethod, SortMethod } from "minimaxer";
import { AI, AIOpts, GameState } from "../dist/index.js";

// Time how long it takes to evaluate a start position to depth 3

function firstMove(opts: AIOpts): void {
    // Create game and tree
    const game = new GameState();
    game.newGame(2);
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

    opts.depth = 4;
    opts.method = SearchMethod.DEEPENING;

    const player = new AI(0, opts);
    player.getMove(game);
}

void suite(
    "Player comparison",

    add("AB Gen", () => {
        const opts = new AIOpts();
        opts.pruning = PruningType.ALPHA_BETA;
        opts.genBased = true;
        firstMove(opts);
    }),
    add("AB Gen Presort", () => {
        const opts = new AIOpts();
        opts.pruning = PruningType.ALPHA_BETA;
        opts.genBased = true;
        opts.presort = true;
        firstMove(opts);
    }),
    add("AB Gen Presort Bubble", () => {
        const opts = new AIOpts();
        opts.pruning = PruningType.ALPHA_BETA;
        opts.genBased = true;
        opts.presort = true;
        opts.sortMethod = SortMethod.BUBBLE;
        firstMove(opts);
    }),
    add("AB Gen Presort Bubble Efficient", () => {
        const opts = new AIOpts();
        opts.pruning = PruningType.ALPHA_BETA;
        opts.genBased = true;
        opts.presort = true;
        opts.sortMethod = SortMethod.BUBBLE_EFFICIENT;
        firstMove(opts);
    }),
    add("Optimal", () => {
        const opts = new AIOpts();
        opts.optimal = true;
        firstMove(opts);
    }),

    add("Optimal Centre", () => {
        const opts = new AIOpts();
        opts.optimal = true;
        opts.config.centre = 0.1;
        opts.config.firstTileValue = 1.5;
        firstMove(opts);
    }),
    add("Optimal Centre quick", () => {
        const opts = new AIOpts();
        opts.optimal = true;
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
