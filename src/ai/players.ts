import * as minimax from "minimaxer";
import { Move, PlayerInterface, PlayerType } from "../azul.js";
import { GameState } from "../state.js";
import { getMovesCallback } from "./ai.js";
import { evalGamestateCallback } from "./evaluation.js";
import { createChildCallback } from "./move_play.js";

// Class to implement
export class AI implements PlayerInterface {
    type = PlayerType.AI;
    gamestate?: GameState;
    name = "";
    constructor(public id: number) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getMove(gs: GameState): Move | undefined {
        return undefined;
    }
    newRound(gamestate: GameState): void {
        this.gamestate = gamestate;
    }
}

function printResult(result: minimax.NegamaxResult<Move>): void {
    if (result.exit == minimax.SearchExit.TIME) {
        console.log("Timeout");
    } else if (result.exit == minimax.SearchExit.FULL_DEPTH) {
        console.log("Full depth");
    } else {
        console.log(result.move);
    }
    console.log(
        "Depth:",
        result.depth,
        "Paths:",
        result.outcomes,
        "Value",
        result.value.toFixed(2),
    );
}

// type of AI possible:
// Depth
// Time
// Deepening
// pruning none/ab
// deepening/time pruning postsort

export enum NegamaxAIMode {
    DEPTH,
    TIME,
    DEEPENING,
}

// Options for creating a Negamax player
export class NegamaxAIOpts extends minimax.NegamaxOpts {
    /** If `true`, the tree is saved between moves and the root moved */
    traverse = false;
    /** If `true` prints lots of interesting info to console */
    print = true;
    /** Search mode to use */
    mode: NegamaxAIMode = NegamaxAIMode.TIME;
    // supply underlying tree opts to constructor
    constructor() {
        super();
    }
}

/** Class that implements the negamax AI player */
export class NegamaxAI extends AI {
    /** Hold the current game tree */
    tree: minimax.Negamax<GameState, Move> | undefined;

    /**
     *
     * @param id Player index, must correspond with gamestate index
     * @param opts Configuration options
     */
    constructor(id: number, public opts: NegamaxAIOpts) {
        super(id);
    }

    /**
     *  Function called when game requires the AI to picka  move
     * @param gamestate
     * @returns
     */
    getMove(gamestate: GameState): Move | undefined {
        if (this.opts.print) {
            console.log(" ====== Player %d turn ======", this.id);
        }
        // Create a tree
        let aim = minimax.NodeAim.MAX;
        if (this.id == 1) {
            aim = minimax.NodeAim.MIN;
        }
        const tree = new minimax.Negamax(
            gamestate,
            aim,
            getMovesCallback,
            createChildCallback,
            evalGamestateCallback,
            this.opts,
        );

        if (this.opts.print) {
            tree.depthCallback = (
                tree: minimax.Negamax<GameState, Move>,
                result: minimax.NegamaxResult<Move>,
            ): void => {
                printResult(result);
            };
        }

        // Get the result
        let result: minimax.NegamaxResult<Move>;
        switch (this.opts.mode) {
            case NegamaxAIMode.DEPTH:
                result = tree.evalDepth();
                break;
            case NegamaxAIMode.DEEPENING:
                result = tree.evalDeepening();
                break;
            case NegamaxAIMode.TIME:
                result = tree.evalTime();
                break;
        }
        if (this.opts.print) {
            printResult(result);
        }
        // Return move
        return result.move;
    }
}
