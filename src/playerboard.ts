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

/**
 * Places tiles in the wall correspnding to full line in the `player`'s board and calulcates score.
 * Does not remove tiles from the lines
 * @param player player whose board the line tiles should be 'taken' from
 * @param wall Wall that the tiles are to be placed in
 * @returns The score for moving these tiles only
 */
export function moveToWall(pb: PlayerBoard, wall: Array<Array<Tile>>): number {
    // if a line is full, puts a tile in the wall.
    // does not remove tiles from lines
    // used for evaluation and end of round
    let score = 0;

    pb.lines.forEach((line, lineindex) => {
        // check if line is full
        if (line.length == lineindex + 1) {
            // find where tile would go on wall
            const tile = line[0];
            // Place on wall
            score += placeOnWall(tile, lineindex, wall);
        }
    });
    // check floor score
    pb.floor.forEach((tile, i) => {
        if (i < PlayerBoard.floorScores.length) {
            score += PlayerBoard.floorScores[i];
        }
    });

    // check if horizontal is complete
    return score;
}

/** Places tile on wall at lineindex, returning the score from it */
export function placeOnWall(tile: Tile, lineindex: number, wall: Array<Array<Tile>>): number {
    let score = 0;
    const colindex = PlayerBoard.wallTypes[lineindex].indexOf(tile);
    // place tile in wall
    wall[lineindex][colindex] = tile;
    // check horizontal scores
    let horscore = 0;
    for (let i = colindex - 1; i >= 0; i--) {
        if (wall[lineindex][i] != Tile.Null) {
            horscore++;
        } else {
            break;
        }
    }
    for (let i = colindex + 1; i < 5; i++) {
        if (wall[lineindex][i] != Tile.Null) {
            horscore++;
        } else {
            break;
        }
    }
    if (horscore) {
        horscore++;
    }
    // check vertical scores
    let vertscore = 0;
    for (let j = lineindex - 1; j >= 0; j--) {
        if (wall[j][colindex] != Tile.Null) {
            vertscore++;
        } else {
            break;
        }
    }
    for (let j = lineindex + 1; j < 5; j++) {
        if (wall[j][colindex] != Tile.Null) {
            vertscore++;
        } else {
            break;
        }
    }
    if (vertscore) {
        vertscore++;
    }

    if (!vertscore && !horscore) {
        score++;
    } else {
        score += vertscore + horscore;
    }
    return score;
}
