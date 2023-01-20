// Module for implementing a general and configurable Azul AI
import * as minimax from "minimaxer";
import { Move } from "../azul.js";
import { GameState } from "../state.js";

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
    const activePlayer = parent.gamestate.activePlayer;

    // Clone gamestate and play move
    const new_gamestate = parent.gamestate.smartClone(move);
    new_gamestate.playMove(move);

    // Evaluate node value
    const data = structuredClone(parent.data) as NodeData;
    if (parent.gamestate.turn == 0) {
        data.values[activePlayer ^ 1] = new_gamestate.evalScore(activePlayer ^ 1);
    }
    data.values[activePlayer] = new_gamestate.evalScore(activePlayer);

    // Create child and return
    let type = minimax.NodeType.INNER;
    if (!new_gamestate.nextTurn()) {
        type = minimax.NodeType.LEAF;
    }
    const child: minimax.Node<GameState, Move, NodeData> = new minimax.Node(
        type,
        new_gamestate,
        move,
    );
    child.data = data;
    child.value = data.values[0] - data.values[1];
    child.moves = new_gamestate.availableMoves;
    return child;
};

/**
 * object to store data that can be passed between nodes, instead of storing on gamestate
 */

export class NodeData {
    /** Array to hold the evaluations of each player board */
    values = [0, 0];
}
