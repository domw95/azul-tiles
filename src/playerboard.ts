import { Move, Tile } from "./azul.js";

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
    /** Get the index of tile colour via a lineindex */
    static wallLocations: number[][] = [
        [0, 1, 2, 3, 4],
        [1, 2, 3, 4, 0],
        [2, 3, 4, 0, 1],
        [3, 4, 0, 1, 2],
        [4, 0, 1, 2, 3],
    ];
    /** Scores of floor locations */
    static floorScores: Array<number> = [-1, -1, -2, -2, -2, -3, -3];
    // static floorScores: Array<number> = [0, 0, 0, 0, 0, 0, 0];

    /** Wall to hold tiles */
    wall: Array<Array<Tile>>;
    /** Wall to hold tiles that will move there at the end of the round*/
    shadowWall: Array<Array<Tile>>;
    /** Lines to place tiles into */
    lines: Array<Array<Tile>>;
    /** Floor for negative scoring tiles */
    floor: Array<Tile>;
    /** Current score for player */
    score = 0;
    /** Score in round up to this point */
    roundScore = 0;
    /** Tracks the max row of each colum has been updated this round */
    roundColUpdate = [-1, -1, -1, -1, -1];
    /** Expected score according to AI */
    expectedScore = 0;
    /** When the board was last updated */
    turnUpdated = -4;

    /**
     *
     * @param id index of player in the game (0-3)
     */
    constructor(public id: number, pb?: PlayerBoard, move?: Move) {
        /** Initialise */

        /** Clone if required */
        if (pb !== undefined && move !== undefined) {
            this.lines = new Array(5) as Tile[][];
            this.shadowWall = new Array(5) as Tile[][];
            // Only clone line and shadow wall that is changing
            for (let i = 0; i < pb.lines.length; i++) {
                if (move.line == i) {
                    this.lines[i] = pb.lines[i].slice(0);
                    this.shadowWall[i] = pb.shadowWall[i].slice(0);
                } else {
                    this.lines[i] = pb.lines[i];
                    this.shadowWall[i] = pb.shadowWall[i];
                }
            }

            // Never clone wall as it does not change in turns
            this.wall = pb.wall;
            // Floor could change every turn
            this.floor = pb.floor.slice(0);
            this.score = pb.score;
            this.expectedScore = pb.expectedScore;
            this.turnUpdated = pb.turnUpdated;
            this.roundScore = pb.roundScore;
        } else {
            this.wall = [[], [], [], [], []];
            this.shadowWall = [[], [], [], [], []];
            this.lines = [[], [], [], [], []];
            this.floor = [];
        }
    }

    /**
     * Fills the wall with {@link Tile.Null}
     * Used after constructor to improve cloning performance
     */
    init(): void {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                this.wall[i][j] = Tile.Null;
                this.shadowWall[i][j] = Tile.Null;
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
        pb.shadowWall = this.shadowWall.map((line) => line.slice(0));
        pb.floor = this.floor.slice(0);
        pb.score = this.score;
        pb.expectedScore = this.expectedScore;
        pb.turnUpdated = this.turnUpdated;
        pb.roundScore = this.roundScore;
        return pb;
    }

    tinyClone(move: Move): PlayerBoard {
        const pb = new PlayerBoard(this.id);

        // Only clone line that is changing
        for (let i = 0; i < this.lines.length; i++) {
            if (move.line == i) {
                pb.lines[i] = this.lines[i].slice(0);
            } else {
                pb.lines[i] = this.lines[i];
            }
        }
        pb.shadowWall = this.shadowWall.map((line) => line.slice(0));

        // Never clone wall as it does not change in turns
        pb.wall = this.wall;
        // Floor could change every turn
        pb.floor = this.floor.slice(0);
        pb.score = this.score;
        pb.expectedScore = this.expectedScore;
        pb.turnUpdated = this.turnUpdated;
        pb.roundScore = this.roundScore;
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

    for (let lineindex = 0; lineindex < 5; lineindex++) {
        // check if line is full
        if (pb.lines[lineindex].length == lineindex + 1) {
            // find where tile would go on wall
            const tile = pb.lines[lineindex][0];
            // Place on wall
            score += placeOnWall(tile, lineindex, wall);
        }
    }
    // check floor score
    for (let i = 0; i < pb.floor.length && i < PlayerBoard.floorScores.length; i++) {
        score += PlayerBoard.floorScores[i];
    }

    // check if horizontal is complete
    return score;
}

/** Places tile on wall at lineindex, returning the score from it */
export function placeOnWall(tile: Tile, lineindex: number, wall: Array<Array<Tile>>): number {
    let score = 0;
    // const colindex = PlayerBoard.wallTypes[lineindex].indexOf(tile);
    const colindex = PlayerBoard.wallLocations[lineindex][tile];
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

/**
 *
 * @param wall Wall to calculate score of
 * @returns The total score from row, columns and colours
 */
export function wallScore(wall: Array<Array<Tile>>): number {
    let score = 0;
    // row scores
    wall.forEach((row) => {
        // check if full row
        if (row.filter((x) => x != Tile.Null).length == 5) {
            score += 2;
        }
    });

    // column scores
    for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 5; i++) {
            if (wall[i][j] == Tile.Null) {
                break;
            } else if (i == 4) {
                score += 7;
            }
        }
    }

    // colour scores
    [Tile.Red, Tile.Yellow, Tile.Black, Tile.Blue, Tile.White].forEach((tile) => {
        // go through to find wall positions
        let fail = false;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (PlayerBoard.wallTypes[i][j] == tile) {
                    if (wall[i][j] != tile) {
                        fail = true;
                        break;
                    }
                }
            }
            if (fail) {
                break;
            }
        }
        if (!fail) {
            score += 10;
        }
    });
    return score;
}
