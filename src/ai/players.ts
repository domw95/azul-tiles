import * as minimax from "minimaxer";
import { Move, PlayerInterface, PlayerType } from "../azul.js";
import { GameState } from "../state.js";
import { getMovesCallback } from "./ai.js";
import { evalGamestateCallback, evalGamestateNice0, evalGamestateNice1 } from "./evaluation.js";
import { generalCallback, NodeData } from "./generic.js";
import { createChildCallback, createChildSmartClone } from "./move_play.js";

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

export const enum CloneMethod {
    STANDARD,
    SMART,
}

export const enum EvalMethod {
    STANDARD,
    CENTRE,
    NICE,
    FORECAST,
    GENERAL,
}

// Options for creating a Negamax player
export class AIOpts extends minimax.NegamaxOpts {
    /** If `true`, the tree is saved between moves and the root moved */
    traverse = false;
    /** If `true` prints lots of interesting info to console */
    print = false;
    /** Game state clone method to use */
    clone: CloneMethod = CloneMethod.STANDARD;
    /** How the gamestate should be evaluated */
    eval: EvalMethod = EvalMethod.STANDARD;
    /** Whether to use the quick evaluation version of the function */
    evalQuick = false;
    // supply underlying tree opts to constructor
    constructor() {
        super();
    }
}

/** Class that implements the negamax AI player */
export class AI implements PlayerInterface {
    type = PlayerType.AI;
    name = "";

    /** Hold the current game tree */
    tree: minimax.Negamax<GameState, Move, unknown> | undefined;

    /**
     *
     * @param id Player index, must correspond with gamestate index
     * @param opts Configuration options
     */
    constructor(public id: number, public opts: AIOpts) {}

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
        let childCallback = createChildCallback;
        if (this.opts.clone == CloneMethod.SMART) {
            childCallback = createChildSmartClone;
        }
        let evalCallback = evalGamestateCallback;
        if (this.opts.eval == EvalMethod.CENTRE) {
            // evalCallback = evalGamestateCentre;
        } else if (this.opts.eval == EvalMethod.NICE) {
            if (this.id == 0) {
                evalCallback = evalGamestateNice0;
            } else {
                evalCallback = evalGamestateNice1;
            }
        } else if (this.opts.eval == EvalMethod.FORECAST) {
            // evalCallback = evalGamestateForecast;
        } else if (this.opts.evalQuick) {
            // evalCallback = evalValueQuick;
        }
        const tree: minimax.Negamax<GameState, Move, any> = new minimax.Negamax(
            gamestate,
            aim,
            gamestate.availableMoves,
            this.opts,
        );
        if (this.opts.eval == EvalMethod.GENERAL) {
            tree.CreateChildNode = generalCallback;
            tree.activeRoot.data = new NodeData();
        } else {
            tree.EvaluateNode = evalCallback;
            tree.GetMoves = getMovesCallback;
            tree.CreateChildNode = childCallback;
        }

        if (this.opts.print) {
            tree.depthCallback = (
                tree: minimax.Negamax<GameState, Move, unknown>,
                result: minimax.NegamaxResult<Move>,
            ): void => {
                console.log("depth");
                printResult(result);
            };
        }

        // Get the result
        const result = tree.evaluate();
        if (this.opts.print) {
            // printResult(result);
            console.log(result);
        }
        // Return move

        return result.move;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    newRound(gs: GameState): void {}
}
