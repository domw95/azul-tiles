import { Tile } from "./azul.js";

/**
 * Represents the Azul players board
 */
export class PlayerBoard {
    /** Location of tiles on the wall */
    static wallTypes: Array<Array<Tile>> = [
        [Tile.Blue, Tile.Yellow, Tile.Red, Tile.Black, Tile.White],
        [Tile.White, Tile.Blue, Tile.Yellow, Tile.Red, Tile.Black],
        [Tile.Black, Tile.White, Tile.Blue, Tile.Yellow, Tile.Red],
        [Tile.Red, Tile.Black, Tile.White, Tile.Blue, Tile.Yellow],
        [Tile.Yellow, Tile.Red, Tile.Black, Tile.White, Tile.Blue],
    ];
    /** Wall to hold tiles */
    wall: Array<Array<Tile>> = [[], [], [], [], []];
    /** Lines to place tiles into */
    lines: Array<Array<Tile>> = [[], [], [], [], []];
    /** Floor for negative scoring tiles */
    floor: Array<Tile> = [];
    /** Current score for player */
    score = 0;
    /** Expected score according to AI */
    expectedScore = 0;
    /** When the board was last updated */
    turnUpdated = -4;
    /** Scores of floor locations */
    static floorScores: Array<number> = [-1, -1, -2, -2, -2, -3, -3];

    /**
     *
     * @param id index of player in the game (0-3)
     */
    constructor(public id: number) {}

    /**
     * Fills the wall with {@link Tile.Null}
     * Used after constructor to improve cloning performance
     */
    init(): void {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                this.wall[i][j] = Tile.Null;
            }
        }
    }

    /**
     * Fast clone of this object
     * @returns A clone of the player board
     */
    clone(): PlayerBoard {
        const pb = new PlayerBoard(this.id);
        pb.lines = this.lines.map((line) => line.slice(0));
        pb.wall = this.wall.map((line) => line.slice(0));
        pb.floor = this.floor.slice(0);
        pb.score = this.score;
        pb.expectedScore = this.expectedScore;
        pb.turnUpdated = this.turnUpdated;
        return pb;
    }
}
