import { GameState } from "../dist/state.js";
import { add, complete, cycle, suite } from "benny";
import { Move, PlayerBoard, Tile } from "../dist/index.js";

const games = new Array(100).fill(new GameState()) as GameState[];

function original(gs: GameState) {
    // Clear list of possible moves
    gs.availableMoves = [];
    // Go through all the factories
    gs.factory.forEach((factory, factoryid) => {
        // for each tile available in factory
        const uniquetiles = new Set(factory);
        uniquetiles.forEach((tile) => {
            // for each of the lines on the players board
            gs.playerBoards[gs.activePlayer].lines.forEach((line, lineNumber) => {
                // check if tile already in wall of gs type
                if (gs.playerBoards[gs.activePlayer].wall[lineNumber].includes(tile)) {
                    // not a valid move
                    // Check if tile/s already in line
                } else if (line.length > 0) {
                    // check if possible move tile matches current line
                    if (line.length < lineNumber + 1 && line[0] == tile) {
                        // is a valid move, add to list
                        gs.availableMoves.push(
                            new Move(gs.activePlayer, factoryid, tile, lineNumber),
                        );
                    }
                } else {
                    // No tiles in line, valid move
                    gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, lineNumber));
                }
            });
            // also add a move straight to the floor
            gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, 5));
        });
    });
}

function getMoveFor(gs: GameState) {
    // Clear list of possible moves
    gs.availableMoves = [];
    // Go through all the factories
    for (let factoryid = 0; factoryid < gs.factory.length; factoryid++) {
        // for each tile available in factory
        const uniquetiles = new Set(gs.factory[factoryid]);
        for (const tile of uniquetiles) {
            // for each of the lines on the players board
            for (let lineNumber = 0; lineNumber < 5; lineNumber++) {
                // check if tile already in wall of gs type
                const line = gs.playerBoards[gs.activePlayer].lines[lineNumber];
                if (gs.playerBoards[gs.activePlayer].wall[lineNumber].includes(tile)) {
                    // not a valid move
                    // Check if tile/s already in line
                } else if (line.length > 0) {
                    // check if possible move tile matches current line
                    if (line.length < lineNumber + 1 && line[0] == tile) {
                        // is a valid move, add to list
                        gs.availableMoves.push(
                            new Move(gs.activePlayer, factoryid, tile, lineNumber),
                        );
                    }
                } else {
                    // No tiles in line, valid move
                    gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, lineNumber));
                }
            }
            // also add a move straight to the floor
            gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, 5));
        }
    }
}

function getMoveForNoSet(gs: GameState) {
    // Clear list of possible moves
    gs.availableMoves = [];
    // Go through all the factories
    for (let factoryid = 0; factoryid < gs.factory.length; factoryid++) {
        // for each tile available in factory
        const usedTile = [false, false, false, false, false];
        for (const tile of gs.factory[factoryid]) {
            if (usedTile[tile]) {
                continue;
            } else {
                usedTile[tile] = true;
            }
            // for each of the lines on the players board
            for (let lineNumber = 0; lineNumber < 5; lineNumber++) {
                // check if tile already in wall of gs type
                const line = gs.playerBoards[gs.activePlayer].lines[lineNumber];
                if (gs.playerBoards[gs.activePlayer].wall[lineNumber].includes(tile)) {
                    // not a valid move
                    // Check if tile/s already in line
                } else if (line.length > 0) {
                    // check if possible move tile matches current line
                    if (line.length < lineNumber + 1 && line[0] == tile) {
                        // is a valid move, add to list
                        gs.availableMoves.push(
                            new Move(gs.activePlayer, factoryid, tile, lineNumber),
                        );
                    }
                } else {
                    // No tiles in line, valid move
                    gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, lineNumber));
                }
            }
            // also add a move straight to the floor
            gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, 5));
        }
    }
}

function getMoveForWithCount(gs: GameState) {
    // Clear list of possible moves
    gs.availableMoves = [];
    // Go through all the factories
    for (let factoryid = 0; factoryid < gs.factory.length; factoryid++) {
        // for each tile available in factory
        const counts = [0, 0, 0, 0, 0];
        for (const tile of gs.factory[factoryid]) {
            counts[tile] += 1;
        }
        for (let tile = 0; tile < 5; tile++) {
            // for each of the lines on the players board
            for (let lineNumber = 0; lineNumber < 5; lineNumber++) {
                // check if tile already in wall of gs type
                const line = gs.playerBoards[gs.activePlayer].lines[lineNumber];
                if (gs.playerBoards[gs.activePlayer].wall[lineNumber].includes(tile)) {
                    // not a valid move
                    // Check if tile/s already in line
                } else if (line.length > 0) {
                    // check if possible move tile matches current line
                    if (line.length < lineNumber + 1 && line[0] == tile) {
                        // is a valid move, add to list
                        gs.availableMoves.push(
                            new Move(gs.activePlayer, factoryid, tile, lineNumber, counts[tile]),
                        );
                    }
                } else {
                    // No tiles in line, valid move
                    gs.availableMoves.push(
                        new Move(gs.activePlayer, factoryid, tile, lineNumber, counts[tile]),
                    );
                }
            }
            // also add a move straight to the floor
            gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, 5, counts[tile]));
        }
    }
}

function getMoveForWithCountTileCheck(gs: GameState) {
    // Clear list of possible moves
    gs.availableMoves = [];
    // Go through all the factories
    for (let factoryid = 0; factoryid < gs.factory.length; factoryid++) {
        // for each tile available in factory
        const counts = [0, 0, 0, 0, 0];
        for (const tile of gs.factory[factoryid]) {
            counts[tile] += 1;
        }
        for (let tile = 0; tile < 5; tile++) {
            // for each of the lines on the players board
            for (let lineNumber = 0; lineNumber < 5; lineNumber++) {
                // check if tile already in wall of gs type
                const line = gs.playerBoards[gs.activePlayer].lines[lineNumber];
                if (
                    gs.playerBoards[gs.activePlayer].wall[lineNumber][
                        PlayerBoard.wallLocations[lineNumber][tile]
                    ] != Tile.Null
                ) {
                    // not a valid move
                    continue;
                    // Check if tile/s already in line
                } else if (line.length > 0) {
                    // check if possible move tile matches current line
                    if (line.length < lineNumber + 1 && line[0] == tile) {
                        // is a valid move, add to list
                        gs.availableMoves.push(
                            new Move(gs.activePlayer, factoryid, tile, lineNumber, counts[tile]),
                        );
                    }
                } else {
                    // No tiles in line, valid move
                    gs.availableMoves.push(
                        new Move(gs.activePlayer, factoryid, tile, lineNumber, counts[tile]),
                    );
                }
            }
            // also add a move straight to the floor
            gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, 5, counts[tile]));
        }
    }
}

function getMoveForWithCountFull(gs: GameState) {
    // Clear list of possible moves
    gs.availableMoves = [];
    // Go through all the factories
    for (let factoryid = 0; factoryid < gs.factory.length; factoryid++) {
        // for each tile available in factory
        const counts = [0, 0, 0, 0, 0];
        for (const tile of gs.factory[factoryid]) {
            counts[tile] += 1;
        }
        for (let tile = 0; tile < 5; tile++) {
            // for each of the lines on the players board
            for (let lineNumber = 0; lineNumber < 5; lineNumber++) {
                // check if tile already in wall of gs type
                const line = gs.playerBoards[gs.activePlayer].lines[lineNumber];
                if (gs.playerBoards[gs.activePlayer].wall[lineNumber].includes(tile)) {
                    // not a valid move
                    // Check if tile/s already in line
                } else if (line.length > 0) {
                    // check if possible move tile matches current line
                    const space = lineNumber + 1 - line.length;
                    if (space && line[0] == tile) {
                        // is a valid move, add to list
                        gs.availableMoves.push(
                            new Move(
                                gs.activePlayer,
                                factoryid,
                                tile,
                                lineNumber,
                                counts[tile],
                                space == counts[tile],
                            ),
                        );
                    }
                } else {
                    // No tiles in line, valid move
                    gs.availableMoves.push(
                        new Move(
                            gs.activePlayer,
                            factoryid,
                            tile,
                            lineNumber,
                            counts[tile],
                            counts[tile] == lineNumber + 1,
                        ),
                    );
                }
            }
            // also add a move straight to the floor
            gs.availableMoves.push(new Move(gs.activePlayer, factoryid, tile, 5, counts[tile]));
        }
    }
}

void suite(
    "Gamestate Clone",

    add("class", () => {
        games.forEach((game) => {
            game.getMoves();
        });
    }),

    add("original", () => {
        games.forEach((game) => {
            original(game);
        });
    }),

    add("For loop", () => {
        games.forEach((game) => {
            getMoveFor(game);
        });
    }),

    add("For loop No Set", () => {
        games.forEach((game) => {
            getMoveForNoSet(game);
        });
    }),

    add("For loop With Count", () => {
        games.forEach((game) => {
            getMoveForWithCount(game);
        });
    }),

    add("For loop With Count Different Check", () => {
        games.forEach((game) => {
            getMoveForWithCountTileCheck(game);
        });
    }),

    add("For loop With Count and full", () => {
        games.forEach((game) => {
            getMoveForWithCountFull(game);
        });
    }),

    cycle(),

    complete(),

    // save({
    //     file: "negamax_unify_" + depth.toString() + "_depth",
    //     folder: "benchmarks/results",
    // }),
);
