import * as minimax from "minimaxer";
import { GameState, Move, PlayerInterface, PlayerType } from "../azul.js";
import { getMovesCallback } from "./ai.js";
import { evalGamestateCallback } from "./evaluation.js";
import { createChildCallback } from "./move_play.js";

// Class to implement
export class AI implements PlayerInterface {
    type = PlayerType.AI;
    gamestate?: GameState;
    name = "";
    constructor(public id: number) {}
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

enum NegamaxAIMode {
    DEPTH,
    TIME,
    DEEPENING,
}

// Options for creating a Negamax player
export class NegamaxAIOpts extends minimax.NegamaxOpts {
    traverse = false;
    // print to console
    print = false;

    // supply underlying tree opts to constructor
    constructor(public mode: NegamaxAIMode) {
        super();
    }
}

/** Class that implements the negamax AI player */
export class NegaxmaxAI extends AI {
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
        const tree = new minimax.Negamax(
            gamestate,
            minimax.NodeAim.MAX,
            getMovesCallback,
            createChildCallback,
            evalGamestateCallback,
            this.opts,
        );
        // Search for move
        const result = tree.evalTime(100);
        if (this.opts.print) {
            printResult(result);
        }
        // Return move
        return result.move;
    }
}
