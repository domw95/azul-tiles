// Different functions to play a move for the game tree
import * as minimax from "minimaxer";
import { Move } from "../azul.js";
import { GameState } from "../state.js";

/**
 * Simple callback to create a new child
 * Uses standard clone function, plays move, checks for next turn and returns node
 */
export const createChildCallback: minimax.CreateChildNodeFunc<GameState, Move> = (
    gamestate: GameState,
    move: Move,
): minimax.Node<GameState, Move> => {
    // Clone gamestate and play move
    const child = gamestate.clone();
    child.playMove(move);
    if (!child.nextTurn()) {
        return new minimax.Node(minimax.NodeType.LEAF, child, move);
    } else {
        return new minimax.Node(minimax.NodeType.INNER, child, move);
    }
};

export const createChildSmartClone: minimax.CreateChildNodeFunc<GameState, Move> = (
    gamestate: GameState,
    move: Move,
): minimax.Node<GameState, Move> => {
    // Clone gamestate and play move
    const child = gamestate.smartClone(move);
    child.playMove(move);
    if (!child.nextTurn()) {
        return new minimax.Node(minimax.NodeType.LEAF, child, move);
    } else {
        return new minimax.Node(minimax.NodeType.INNER, child, move);
    }
};

// Clone gamestate from node, create new node with gamestate
// mark new node if LEAF
// export function movePlay(node: minimax.Node, branch: TreeBranch): minimax.Node {
//     // clone the gamestate
//     const gs = node.gamestate.clone() as GameState;
//     // get the move
//     const move = branch.move;
//     // play the move
//     gs.playMove(move);
//     // check if end of turn
//     let type = minimax.NodeType.INNER;
//     if (!gs.nextTurn()) {
//         type = minimax.NodeType.LEAF;
//     }
//     // create new node
//     const child = new minimax.Node(type, gs, node);
//     child.aim = -node.aim;
//     return child;
// }

// export function movePlaySmart(node: minimax.Node, branch: TreeBranch): minimax.Node {
//     // get the move
//     const move = branch.move;
//     // smart clone gamestate
//     const gs = node.gamestate.smart_clone(move);
//     // play the move
//     gs.playMove(move);
//     // check if end of turn
//     var type = minimax.NodeType.INNER;
//     if (!gs.nextTurn()) {
//         type = minimax.NodeType.LEAF;
//     }
//     // create new node
//     const child = new minimax.Node(type, gs, node);
//     child.aim = -node.aim;
//     return child;
// }

// // Clone gamestate from node, create new node with gamestate
// // mark new node if LEAF
// export function movePlayQuick(node: minimax.Node, branch: TreeBranch): minimax.Node {
//     // clone the gamestate
//     const gs = node.gamestate.clone() as GameState;
//     // get the move
//     const move = branch.move;
//     const player = gs.activePlayer;
//     // play the move
//     gs.playMove(move);
//     // check if end of turn
//     var type = minimax.NodeType.INNER;
//     if (!gs.nextTurn()) {
//         type = minimax.NodeType.LEAF;
//     }
//     gs.playerBoards[player].expectedScore = gs.evalScore(player);
//     // create new node
//     const child = new minimax.Node(type, gs, node);
//     child.aim = -node.aim;
//     return child;
// }
