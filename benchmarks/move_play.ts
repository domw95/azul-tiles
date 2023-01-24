import { GameState, State } from "../dist/state.js";
import { add, complete, cycle, suite } from "benny";
import { Move, Tile } from "../dist/index.js";

const games = new Array(100).fill(new GameState()) as GameState[];
games.forEach((game) => {
    game.newGame(2);
});

function playMoveOriginal(gs: GameState, move: Move): void {
    if (gs.state != State.turn || gs.activePlayer != move.player) {
        throw Error("Invalid state for gs move");
    }
    gs.playedMoves.push(move);
    const pb = gs.playerBoards[move.player];
    // get the tiles from the factory
    const tiles = gs.factory[move.factory].filter((tile) => tile == move.tile);
    const discardtiles = gs.factory[move.factory].filter((tile) => tile != move.tile);

    // if centre, set new tilelist
    if (move.factory == 0) {
        gs.factory[0] = discardtiles;
        // add firstplayer tile if required.
        if (gs.firstTile == Tile.FirstPlayer) {
            pb.floor.push(Tile.FirstPlayer);
            gs.firstTile = Tile.Null;
        }
    } else {
        // put extra tiles in centre
        discardtiles.forEach((tile) => {
            gs.factory[0].push(tile);
        });
        // clear factory
        gs.factory[move.factory] = [];
    }

    // add each of the picked up tiles to players board
    tiles.forEach((tile) => {
        // check if straight to floor
        if (move.line == 5) {
            pb.floor.push(tile);
        } else {
            const length = pb.lines[move.line].length;
            // check if space to append and corret type
            if (length == 0 || (length < move.line + 1 && pb.lines[move.line][0] == tile)) {
                pb.lines[move.line].push(tile);
            } else {
                pb.floor.push(tile);
            }
        }
    });

    gs.state = State.turnEnd;
}

function playMoveNoFilter(gs: GameState, move: Move): void {
    if (gs.state != State.turn || gs.activePlayer != move.player) {
        throw Error("Invalid state for gs move");
    }
    gs.playedMoves.push(move);
    const pb = gs.playerBoards[move.player];
    // get the tiles from the factory
    const discardtiles = gs.factory[move.factory].filter((tile) => tile != move.tile);

    // if centre, set new tilelist
    if (move.factory == 0) {
        gs.factory[0] = discardtiles;
        // add firstplayer tile if required.
        if (gs.firstTile == Tile.FirstPlayer) {
            pb.floor.push(Tile.FirstPlayer);
            gs.firstTile = Tile.Null;
        }
    } else {
        // put extra tiles in centre
        discardtiles.forEach((tile) => {
            gs.factory[0].push(tile);
        });
        // clear factory
        gs.factory[move.factory] = [];
    }

    // add each of the picked up tiles to players board
    if (move.line != 5) {
        for (let i = 0; i < move.count; i++) {
            const length = pb.lines[move.line].length;
            if (length == 0 || (length < move.line + 1 && pb.lines[move.line][0] == move.tile)) {
                pb.lines[move.line].push(move.tile);
            } else {
                pb.floor.push(move.tile);
            }
        }
    } else {
        for (let i = 0; i < move.count; i++) {
            pb.floor.push(move.tile);
        }
    }
    gs.state = State.turnEnd;
}

function playMoveNoFilterNoCheck(gs: GameState, move: Move): void {
    if (gs.state != State.turn || gs.activePlayer != move.player) {
        throw Error("Invalid state for gs move");
    }
    gs.playedMoves.push(move);
    const pb = gs.playerBoards[move.player];
    // get the tiles from the factory
    const discardtiles = gs.factory[move.factory].filter((tile) => tile != move.tile);

    // if centre, set new tilelist
    if (move.factory == 0) {
        gs.factory[0] = discardtiles;
        // add firstplayer tile if required.
        if (gs.firstTile == Tile.FirstPlayer) {
            pb.floor.push(Tile.FirstPlayer);
            gs.firstTile = Tile.Null;
        }
    } else {
        // put extra tiles in centre
        discardtiles.forEach((tile) => {
            gs.factory[0].push(tile);
        });
        // clear factory
        gs.factory[move.factory] = [];
    }

    // add each of the picked up tiles to players board
    if (move.line != 5) {
        for (let i = 0; i < move.count; i++) {
            const length = pb.lines[move.line].length;
            if (length <= move.line) {
                pb.lines[move.line].push(move.tile);
            } else {
                pb.floor.push(move.tile);
            }
        }
    } else {
        for (let i = 0; i < move.count; i++) {
            pb.floor.push(move.tile);
        }
    }
    gs.state = State.turnEnd;
}

function playMoveNoFilterNoError(gs: GameState, move: Move): void {
    gs.playedMoves.push(move);
    const pb = gs.playerBoards[move.player];
    // get the tiles from the factory
    const discardtiles = gs.factory[move.factory].filter((tile) => tile != move.tile);

    // if centre, set new tilelist
    if (move.factory == 0) {
        gs.factory[0] = discardtiles;
        // add firstplayer tile if required.
        if (gs.firstTile == Tile.FirstPlayer) {
            pb.floor.push(Tile.FirstPlayer);
            gs.firstTile = Tile.Null;
        }
    } else {
        // put extra tiles in centre
        discardtiles.forEach((tile) => {
            gs.factory[0].push(tile);
        });
        // clear factory
        gs.factory[move.factory] = [];
    }

    // add each of the picked up tiles to players board
    if (move.line != 5) {
        for (let i = 0; i < move.count; i++) {
            const length = pb.lines[move.line].length;
            if (length <= move.line) {
                pb.lines[move.line].push(move.tile);
            } else {
                pb.floor.push(move.tile);
            }
        }
    } else {
        for (let i = 0; i < move.count; i++) {
            pb.floor.push(move.tile);
        }
    }
    gs.state = State.turnEnd;
}

void suite(
    "Gamestate Play Move",

    add("class", () => {
        games.forEach((game) => {
            const game0 = new GameState(game, game.availableMoves[0]);
            game0.playMove(game.availableMoves[0]);
        });
    }),

    add("original", () => {
        games.forEach((game) => {
            const game0 = new GameState(game, game.availableMoves[0]);
            playMoveOriginal(game0, game.availableMoves[0]);
        });
    }),
    add("No filter", () => {
        games.forEach((game) => {
            const game0 = new GameState(game, game.availableMoves[0]);
            playMoveNoFilter(game0, game.availableMoves[0]);
        });
    }),
    add("No filter, No Check", () => {
        games.forEach((game) => {
            const game0 = new GameState(game, game.availableMoves[0]);
            playMoveNoFilterNoCheck(game0, game.availableMoves[0]);
        });
    }),

    add("No filter, No Check, No Error", () => {
        games.forEach((game) => {
            const game0 = new GameState(game, game.availableMoves[0]);
            playMoveNoFilterNoError(game0, game.availableMoves[0]);
        });
    }),

    cycle(),

    complete(),

    // save({
    //     file: "negamax_unify_" + depth.toString() + "_depth",
    //     folder: "benchmarks/results",
    // }),
);
