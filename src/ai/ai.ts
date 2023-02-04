import * as mx from "minimaxer";
import { Move, PlayerInterface, PlayerType } from "../azul.js";
import { GameState } from "../state.js";
import { generalCallback, moveFilter, NodeData } from "./callback.js";
import { EvalConfig } from "./evaluation.js";

export function printResult(result: mx.NegamaxResult<Move>): void {
    if (result.exit == mx.SearchExit.TIME) {
        console.log("Timeout");
    } else if (result.exit == mx.SearchExit.FULL_DEPTH) {
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

export const enum EvalMethod {
    STANDARD,
    CENTRE,
    NICE,
}

// Options for creating a Negamax player
export class AIOpts extends mx.NegamaxOpts {
    /** If `true`, the tree is saved between moves and the root moved */
    traverse = false;
    /** If `true` prints lots of interesting info to console */
    print = false;
    /** Determines how the AI evaluates the games */
    config = new EvalConfig();
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
    tree: mx.Negamax<GameState, Move, unknown> | undefined;

    /**
     *
     * @param id Player index, must correspond with gamestate index
     * @param opts Configuration options
     */
    constructor(public id: number, public opts: AIOpts) {}

    /**
     *  Function called when game requires the AI to picks  move
     * @param gamestate
     * @returns
     */
    getMove(gamestate: GameState): Move | undefined {
        if (this.opts.print) {
            console.log(" ====== Player %d turn ======", this.id);
        }
        // Create a tree
        const aim = this.id == 0 ? mx.NodeAim.MAX : mx.NodeAim.MIN;

        // Create root node
        const root = new mx.Node(
            mx.NodeType.ROOT,
            gamestate.clone(),
            new Move(0, 0, 0, 0),
            new NodeData(),
            aim,
            moveFilter(gamestate, this.opts.config),
        );
        // Set config on data
        root.data.config = this.opts.config;
        // Create tree
        const tree = new mx.Negamax(root, this.opts);
        // Assign callback to tree
        tree.CreateChildNode = generalCallback;

        if (this.opts.print) {
            tree.depthCallback = (
                tree: mx.Negamax<GameState, Move, NodeData>,
                result: mx.NegamaxResult<Move>,
            ): void => {
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
