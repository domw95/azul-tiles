// Main entry point to module
// rexport subfiles from here

import { GameState } from "./state.js";

/** All the types of tiles availabe in the game */
export enum Tile {
    Blue,
    Yellow,
    Red,
    Black,
    White,
    /** Only exists in centre or on a players floor */
    FirstPlayer,
    /** For Walls and tilebag to indicate no tile present */
    Null = -1,
}

/** A move that can be performed in the game */
export class Move {
    constructor(
        public player: number,
        public factory: number,
        public tile: Tile,
        public line: number,
        public count = 0,
        public full = false,
    ) {}
}

export enum PlayerType {
    HUMAN,
    AI,
}

/**
 * Interface required for an object to play a game
 */
export interface PlayerInterface {
    type: PlayerType;
    id: number;
    name: string;
    /**
     * Called when a move is required from player
     * Returns undefined if move is async
     * * @param gs the current gamestate
     */
    getMove(gs: GameState): Move | undefined;
    /**
     * Called at start of round for player to initialise anything
     * @param gs the current gamestate
     */
    newRound(gs: GameState): void;
}
