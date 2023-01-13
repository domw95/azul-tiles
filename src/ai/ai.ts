import * as minimax from "minimaxer";
import { Move } from "../azul.js";
import { GameState } from "../state.js";

/** Callback to return a list of moves */
export const getMovesCallback: minimax.GetMovesFunc<GameState, Move> = (
    gamestate: GameState,
): Array<Move> => {
    return gamestate.availableMoves;
};
