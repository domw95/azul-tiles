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

    // Clone node data
    const data = new NodeData(parent.data.nplayers, parent.data);

    // Updated values than need updating
    for (let player = 0; player < 2; player++) {
        if (activePlayer == player || !data.updated[player] || !data.config.quickEval) {
            data.values[player] = evaluate(gamestate, undefined, player, data.config);
            data.updated[player] = true;
        }
    }

    // Check child type
    const type = gamestate.nextTurn() ? minimax.NodeType.INNER : minimax.NodeType.LEAF;

    // Create child, Assign value to child and return
    const child = new minimax.Node(
        type,
        gamestate,
        move,
        data,
        undefined,
        moveFilter(gamestate, data.config),
    );
    child.value = data.values[0] - data.values[1];
    return child;
};
/**
 * Callback function for multiplayer AI (3 or 4 players in game)
 * @param parent Parent to clone and apply move to
 * @param move move to play
 * @returns child node
 */
export const multiplayerCallback: minimax.CreateChildNodeFunc<GameState, Move, NodeData> = (
    parent: minimax.Node<GameState, Move, NodeData>,
    move: Move,
): minimax.Node<GameState, Move, NodeData> => {
    // Clone gamestate and play move
    const gamestate = new GameState(parent.gamestate, move);
    // const new_gamestate = parent.gamestate.smartClone(move);
    gamestate.playMove(move);

    // Get active player
    const activePlayer = parent.gamestate.activePlayer;

    // Clone node data
    const data = new NodeData(parent.data.nplayers, parent.data);

    // Perform evaluation
    // Updated values than need updating
    for (let player = 0; player < data.nplayers; player++) {
        if (activePlayer == player || !data.updated[player] || !data.config.quickEval) {
            data.values[player] = evaluate(gamestate, undefined, player, data.config);
            data.updated[player] = true;
        }
    }

    // Check child type
    const type = gamestate.nextTurn() ? minimax.NodeType.INNER : minimax.NodeType.LEAF;

    // Filter out straight to floor moves if in config

    // Create child, Assign value to child and return
    const child = new minimax.Node(
        type,
        gamestate,
        move,
        parent.data,
        undefined,
        moveFilter(gamestate, parent.data.config),
    );

    child.scores = data.values;
    child.activePlayer = gamestate.activePlayer;
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
    updated: boolean[] = [];

    constructor(public nplayers: number, parent?: NodeData) {
        if (parent !== undefined) {
            this.values = parent.values.slice(0);
            this.config = parent.config;
            this.updated = parent.updated.slice(0);
        } else {
            this.values = new Array(nplayers).fill(0) as number[];
            this.updated = new Array(nplayers).fill(false) as boolean[];
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
