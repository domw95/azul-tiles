/* eslint-disable @typescript-eslint/no-unsafe-call */
import { add, complete, cycle, suite } from "benny";
import { PruningType, SearchMethod, SortMethod } from "minimaxer";
import { AI, AIOpts, GameState } from "../dist/index.js";

// Time how long it takes to evaluate a start position to depth 3

function firstMove(opts: AIOpts): void {
    // Create game and tree
    const game = new GameState();
    game.newGame(2);
    // game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    // game.nextTurn();
    // game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    // game.nextTurn();
    // game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    // game.nextTurn();
    // game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    // game.nextTurn();
    // game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    // game.nextTurn();
    // game.playMove(game.availableMoves[Math.floor(Math.random() * game.availableMoves.length)]);
    // game.nextTurn();

    opts.depth = 2;
    opts.method = SearchMethod.DEEPENING;

    const player = new AI(0, opts);
    player.getMove(game);
}

void suite(
    "Player comparison",

    add("Standard settings", () => {
        const opts = new AIOpts();
        firstMove(opts);
    }),
    add("AB", () => {
        const opts = new AIOpts();
        opts.pruning = PruningType.ALPHA_BETA;
        firstMove(opts);
    }),
    add("AB Gen", () => {
        const opts = new AIOpts();
        opts.pruning = PruningType.ALPHA_BETA;
        opts.genBased = true;
        firstMove(opts);
    }),
    add("AB Presort", () => {
        const opts = new AIOpts();
        opts.pruning = PruningType.ALPHA_BETA;
        opts.presort = true;
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
    add("Optimal Quick eval", () => {
        const opts = new AIOpts();
        opts.optimal = true;
        opts.config.quickEval = true;
        firstMove(opts);
    }),

    add("AB Gen Presort Bubble Move Quick eval", () => {
        const opts = new AIOpts();
        opts.pruning = PruningType.ALPHA_BETA;
        opts.genBased = true;
        opts.presort = true;
        opts.sortMethod = SortMethod.BUBBLE;
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
