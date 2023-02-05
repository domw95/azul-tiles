// A bunch of different function to evaluate a game state
import { Move, Tile } from "../azul.js";
import { placeOnWall, PlayerBoard, wallScore } from "../playerboard.js";
import { GameState } from "../state.js";

/**
 * Object for configuring how the main evaluation function performs
 */
export class EvalConfig {
    /** If `false`, evaluate each player board every move, if `true` only update when required */
    quickEval = false;
    /** Enable the centre weighting value */
    centre = 0;
    /** Value of having the first player tile */
    firstTileValue = 0;
    /** Multiplier for number of tiles in move */
    tileCountValue = 0;
    /** Multiplier for line number (1 to 5) */
    lineValue = 0;
    /** Remove moves that go direct to floor in the early turns and rounds*/
    movePruning = false;
    /** Don't consider the opponents score when evaluating */
    friendly = false;
    /** Try to forecast score from non-empty lines */
    forecast = 0;
}

/** Returns a value of the gamestate for the player based on config and just played move */
export function evaluate(
    gamestate: GameState,
    move: Move | undefined,
    player: number,
    config: EvalConfig,
) {
    let value = 0;
    // First player tile value
    if (gamestate.playerBoards[player].floor[0] == Tile.FirstPlayer && gamestate.round < 4) {
        value += config.firstTileValue;
    }

    if (move !== undefined && move?.line != 5) {
        // Tile count value
        value += config.tileCountValue * move.count;
        // Line value
        value += config.lineValue * (move.line + 1);
    }
    // Playing pieces towards centre
    if (config.centre && gamestate.round < 2) {
        value += config.centre * centreEvaluation(gamestate.playerBoards[player].shadowWall);
    }
    // Forecasting evaluation
    if (config.forecast) {
        value += config.forecast * forecastEvaluation(gamestate, player);
    }
    return currentScore(gamestate.playerBoards[player]) + value;
}

function currentScore(pb: PlayerBoard) {
    // return pb.score + pb.roundScore + pb.bonusScore;
    return Math.max(0, pb.score + pb.roundScore + pb.bonusScore);
}

// Centre Based evaluation

/** Weights for each tile in wall */
const CENTRE_WEIGHTS = [
    [0.95, 0.96, 0.97, 0.96, 0.95],
    [0.96, 0.97, 0.98, 0.97, 0.96],
    [0.97, 0.98, 0.99, 0.98, 0.97],
    [0.96, 0.97, 0.98, 0.97, 0.96],
    [0.95, 0.96, 0.97, 0.96, 0.95],
];

/** Function evaluate a wall for centre */
function centreEvaluation(wall: Tile[][]): number {
    let value = 0;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (wall[row][col] != Tile.Null) {
                value += CENTRE_WEIGHTS[row][col];
            }
        }
    }
    return value;
}

function forecastEvaluation(gs: GameState, player: number): number {
    const round_weight = Math.max(0, 4 - gs.round) / 5;
    const pb = gs.playerBoards[player];
    const wall: Tile[][] = [[], [], [], [], []];
    for (let i = 0; i < 5; i++) {
        wall[i] = pb.shadowWall[i].slice(0);
    }
    let exp_score = 0;
    // Get possible scores for almost full lines
    for (let i = 1; i < 5; i++) {
        const length = i + 1;
        const missing = length - pb.lines[i].length;
        // If some tiles in line but not full
        if (missing && missing < length) {
            exp_score += (placeOnWall(pb.lines[i][0], i, wall) * round_weight) / (missing + 0.5);
        }
    }
    return exp_score;
}

// row = line index
// column = rounds left
// const v3weights = [
//     [0, 9, 9.5, 9.9, 9.9],
//     [0, 6, 7, 8, 8.5],
//     [0, 3, 4, 5, 5.5],
//     [0, 1.5, 2, 2.5, 3],
//     [0, 0.8, 1, 1.5, 2],
// ];
// function expectedScoreV3(gs: GameState, player: number): number {
//     // Active player board
//     const pb = gs.playerBoards[player];
//     // Create walls for each player
//     const walls = gs.playerBoards.map((pb) => pb.wall.map((line) => line.slice(0)));
//     // Get scores
//     const scores = walls.map((wall, playerind) => gs.moveToWall(playerind, wall));
//     // How full each row of walls are
//     const rowFill = walls.map((wall) =>
//         wall.map((row) => row.filter((x) => x != Tile.Null).length),
//     );
//     // Check min rounds remaining after current round (for current state)
//     const rounds = 5 - rowFill.reduce((a, b) => Math.max(a, ...b), 0);
//     const wall = walls[player];
//     let score = scores[player] + pb.score;

//     let exp_score = 0;
//     // row scores
//     rowFill[player].forEach((len, n) => {
//         // check if full row
//         if (len == 5) {
//             score += 2;
//         } else if (rounds + len >= 5) {
//             exp_score += 2 * 0.1 * v3weights[n][rounds];
//         }
//     });

//     // column scores
//     const colweights = wall.reduce(
//         (weights, row, rowind) => {
//             row.forEach((tile, colind) => {
//                 if (tile != Tile.Null) {
//                     weights[colind] += 10;
//                 } else {
//                     weights[colind] += v3weights[rowind][colind];
//                 }
//             });
//             return weights;
//         },
//         [0, 0, 0, 0, 0],
//     );

//     // sort to get full columns first, then best options
//     colweights.sort((a, b) => b - a);
//     // number of non-full columns to consider
//     let colkeep = rounds;
//     colweights.forEach((weight) => {
//         // Add column score for 5 weight
//         if (weight == 50) {
//             score += 7;
//         } else if (colkeep) {
//             exp_score += (7 * weight) / 50;
//             colkeep--;
//         }
//     });

//     // colour scores
//     // shuffle wall so colours are aligned in columns
//     wall.forEach((row, ind) => {
//         for (let i = ind; i; i--) {
//             row.push(row.shift() as Tile);
//         }
//     });
//     // Then same operation as columns
//     // colour scores
//     const colourweights = wall.reduce(
//         (weights, row, rowind) => {
//             row.forEach((tile, colind) => {
//                 if (tile != Tile.Null) {
//                     weights[colind] += 10;
//                 } else {
//                     weights[colind] += v3weights[rowind][colind];
//                 }
//             });
//             return weights;
//         },
//         [0, 0, 0, 0, 0],
//     );

//     // sort to get full columns first, then best options
//     colourweights.sort((a, b) => b - a);
//     // number of non-full columns to consider
//     let colourkeep = rounds;
//     colourweights.forEach((weight) => {
//         // Add column score for 5 weight
//         if (weight == 50) {
//             score += 10;
//         } else if (colourkeep) {
//             exp_score += (10 * weight) / 50;
//             colourkeep--;
//         }
//     });

//     return score;
// }
