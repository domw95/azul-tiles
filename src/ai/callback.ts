// Module for implementing a general and configurable Azul AI
import * as minimax from "minimaxer";
import { Move } from "../azul.js";
import { GameState } from "../state.js";
import { EvalConfig, evaluate } from "./evaluation.js";

/**
 * Main function that implements all the logic.
 * Is called when negamax requires to branch a child from parent
 * Assign moves and value means no other callback is required
 * @param parent The parent node that is to be branched
 * @param move  The move used to go from the parent to child
 * @returns A child node representing the new gamestate
 */
export const generalCallback: minimax.CreateChildNodeFunc<GameState, Move, NodeData> = (
    parent: minimax.Node<GameState, Move, NodeData>,
    move: Move,
): minimax.Node<GameState, Move, NodeData> => {
    // Clone gamestate and play move
    const gamestate = new GameState(parent.gamestate, move);
    // const new_gamestate = parent.gamestate.smartClone(move);
    gamestate.playMove(move);

    // Get active player
    const activePlayer = parent.gamestate.activePlayer;

    // Perform evaluation
    let data = parent.data;
    let value = 0;
    // Check if quick eval on
    if (parent.data?.config.quickEval) {
        // Clone node data
        data = new NodeData(parent.data);
        // get opponent player
        const opponent = activePlayer ^ 1;

        // Update opponent if required
        if (!data.updated) {
            data.values[opponent] = evaluate(gamestate, undefined, opponent, data.config);
            data.updated = true;
        }
        // Update active player
        data.values[activePlayer] = evaluate(gamestate, move, activePlayer, data.config);
        value = data.values[0] - data.values[1];
    } else if (data != undefined) {
        // Evaluate both players
        // get previous move
        const prev_move = gamestate.playedMoves.at(-1);
        if (activePlayer == 0) {
            value =
                evaluate(gamestate, move, 0, data?.config) -
                evaluate(gamestate, prev_move, 1, data?.config);
        } else {
            value =
                evaluate(gamestate, prev_move, 0, data?.config) -
                evaluate(gamestate, move, 1, data?.config);
        }
    }

    // Check child type
    let type = minimax.NodeType.INNER;
    if (!gamestate.nextTurn()) {
        type = minimax.NodeType.LEAF;
    }

    // Filter out straight to floor moves if in config

    // Create child, Assign value to child and return
    const child = new minimax.Node(
        type,
        gamestate,
        move,
        data,
        undefined,
        moveFilter(gamestate, data.config),
    );
    child.value = value;
    return child;
};

/**
 * object to store data that can be passed between nodes, instead of storing on gamestate
 */

export class NodeData {
    /** Array to hold the evaluations of each player board */
    values: number[];
    /** Object with config related to evaluation of gamestate */
    config = new EvalConfig();
    /** `true` if the values array is up to date */
    updated = false;

    constructor(parent?: NodeData) {
        if (parent !== undefined) {
            this.values = parent.values.slice(0);
            this.config = parent.config;
            this.updated = parent.updated;
        } else {
            this.values = [0, 0];
        }
    }
}

export function moveFilter(gamestate: GameState, config: EvalConfig): Move[] {
    let moves = gamestate.availableMoves;
    if (config.movePruning && gamestate.turn < 4 && gamestate.round < 4) {
        moves = moves.filter((move) => move.line != 5);
        if (moves.length == 0) {
            moves = gamestate.availableMoves;
        }
    }
    return moves;
}
