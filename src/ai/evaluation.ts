// A bunch of different function to evaluate a game state
import * as minimax from "minimaxer";
import { Tile } from "../azul.js";
import { moveToWall, placeOnWall, PlayerBoard } from "../playerboard.js";
import { GameState } from "../state.js";

/** Simplest gamestate evaluation function */
export const evalGamestateCallback: minimax.EvaluateGamestateFunc<GameState> = (
    gamestate: GameState,
) => {
    return gamestate.evalScore(0) - gamestate.evalScore(1);
};

/** Nice evaluation function, only cares about its own score */
export const evalGamestateNice0: minimax.EvaluateGamestateFunc<GameState> = (
    gamestate: GameState,
) => {
    return gamestate.evalScore(0);
};
export const evalGamestateNice1: minimax.EvaluateGamestateFunc<GameState> = (
    gamestate: GameState,
) => {
    return -gamestate.evalScore(1);
};

/** Centre based evaluation function  */
export const evalGamestateCentre: minimax.EvaluateGamestateFunc<GameState> = (
    gamestate: GameState,
) => {
    return expectedScoreCentre(gamestate, 0) - expectedScoreCentre(gamestate, 1);
};

/** Forecast future score with weight based on round number / row
 *
 */
export const evalGamestateForecast: minimax.EvaluateGamestateFunc<GameState> = (
    gamestate: GameState,
) => {
    return expectedScoreForecast(gamestate, 0) - expectedScoreForecast(gamestate, 1);
};

function expectedScoreCentre(gs: GameState, player: number): number {
    // Get the
    const pb = gs.playerBoards[player];
    const wall = pb.wall.map((line) => line.slice(0));
    let score = moveToWall(pb, wall) + pb.score; //+ gs.wallScore(wall)
    if (score < 0) {
        score = 0;
    }
    let exp_score = 0;
    const weights = [
        [0.95, 0.96, 0.97, 0.96, 0.95],
        [0.96, 0.97, 0.98, 0.97, 0.96],
        [0.97, 0.98, 0.99, 0.98, 0.97],
        [0.96, 0.97, 0.98, 0.97, 0.96],
        [0.95, 0.96, 0.97, 0.96, 0.95],
    ];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            if (wall[row][col] != Tile.Null) {
                exp_score += weights[row][col];
            }
        }
    }
    return score + exp_score;
}

export const evalValueQuick: minimax.EvaluateGamestateFunc<GameState> = (
    gamestate: GameState,
): number => {
    // Player that just performed move to get to this state
    const player = gamestate.previousPlayer;
    const other = player ^ 1;
    // Update score from most recent player
    gamestate.playerBoards[player].expectedScore = gamestate.evalScore(player);
    gamestate.playerBoards[player].turnUpdated = gamestate.turn;
    // Check if opponent needs updating
    if (gamestate.turn - gamestate.playerBoards[other].turnUpdated > 1) {
        gamestate.playerBoards[other].expectedScore = gamestate.evalScore(other);
        gamestate.playerBoards[other].turnUpdated = gamestate.turn;
    }
    return gamestate.playerBoards[0].expectedScore - gamestate.playerBoards[1].expectedScore;
};

// export function evalValueV2(node: minimax.Node): number {
//     return expectedScoreV2(node.gamestate, 0) - expectedScoreV2(node.gamestate, 1);
// }

function expectedScoreForecast(gs: GameState, player: number): number {
    const round_weight = Math.max(0, 4 - gs.round) / 4;
    // Get the
    const pb = gs.playerBoards[player];
    const wall = pb.wall.map((line) => line.slice(0));
    // Get scores for moving full lines to wall
    let score = moveToWall(pb, wall) + pb.score;
    if (score < 0) {
        score = 0;
    }

    let exp_score = 0;
    // Get possible scores for almost full lines
    for (let i = 1; i < 5; i++) {
        const length = i + 1;
        const missing = length - pb.lines[i].length;
        // If some tiles in line but not full
        if (missing && missing < length) {
            exp_score += (placeOnWall(pb.lines[i][0], i, wall) * round_weight) / missing;
        }
    }
    return score + exp_score;
}

// export function evalValueQuickV3(node: minimax.Node): number {
//     const gs = node.gamestate as GameState;
//     // Player that just performed move to get to this state
//     const player = gs.previousPlayer;
//     const other = player ^ 1;
//     // Update score from most recent player
//     gs.playerBoards[player].expectedScore = expectedScoreV3(gs, player);
//     gs.playerBoards[player].turnUpdated = gs.turn;
//     // Check if opponent needs updating
//     if (gs.turn - gs.playerBoards[other].turnUpdated > 1) {
//         gs.playerBoards[other].expectedScore = expectedScoreV3(gs, other);
//         gs.playerBoards[other].turnUpdated = gs.turn;
//     }
//     return gs.playerBoards[0].expectedScore - gs.playerBoards[1].expectedScore;
// }
// // row = line index
// // column = rounds left
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
//     const rowFill = walls.map((wall) => wall.map((row) => row.filter((x) => x != Tile.Null).length));
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

// export function evalValueV4(node: minimax.Node): number {
//     return expectedScoreV4(node.gamestate, 0) - expectedScoreV4(node.gamestate, 1);
// }

// // Maximin (2+ players) score evaluation
// export function evalScores(node: minimax.Node): Array<number> {
//     // create array of scores
//     const gs = node.gamestate as GameState;
//     const scores: Array<number> = [];
//     for (var i = 0; i < gs.nPlayers; i++) {
//         const expScore = gs.playerBoards[i].expectedScore;
//         if (i == gs.previousPlayer) {
//             const score = gs.evalScore(i);
//             scores.push(score);
//             gs.playerBoards[i].expectedScore = score;
//         } else if (expScore != undefined) {
//             scores.push(expScore);
//         } else {
//             const score = gs.evalScore(i);
//             scores.push(score);
//             gs.playerBoards[i].expectedScore = score;
//         }
//     }
//     return scores;
// }

// // Maximin (2+ players) value evaluation from scores
// export function evalValueMulti(node: minimax.Node): number {
//     const gs = node.gamestate as GameState;
//     const playerscore = node.score[gs.previousPlayer];
//     let value = Infinity;
//     for (var i = 0; i < gs.nPlayers; i++) {
//         if (i != gs.previousPlayer) {
//             value = Math.min(value, playerscore - node.score[i]);
//         }
//     }
//     return value;
// }
