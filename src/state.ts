// All the classes for gamestate management

import seedrandom from "seedrandom";
import { Move, Tile } from "./azul.js";
import { PlayerBoard } from "./playerboard.js";

//
export enum State {
    start,
    turn,
    turnEnd,
    endOfTurns,
    roundEnd,
    gameEnd,
}

/** Full representation of the  azul game */
export class GameState {
    tilebag: Array<Tile> = [];
    factory: Array<Array<Tile>> = [];
    firstTile: Tile = Tile.FirstPlayer;
    playerBoards: Array<PlayerBoard> = [];

    availableMoves: Array<Move> = [];
    playedMoves: Array<Move> = [];

    nPlayers = 0;
    round = 0;
    turn = 0;
    activePlayer = 0;
    startingPlayer = 0;
    previousPlayer = 0;

    winner: Array<number> = [];

    state: State = State.start;

    seed: string = Math.random().toString();
    rng: seedrandom.PRNG = seedrandom();

    constructor(seed?: string) {
        if (typeof seed !== "undefined") {
            this.seed = seed;
        }
    }

    // Starts a new game, new round, ready for first turn
    newGame(nPlayers: number): void {
        // Create rng

        this.rng = seedrandom(this.seed);
        // Create player boards
        this.nPlayers = nPlayers;
        for (let i = 0; i < this.nPlayers; i++) {
            const pb = new PlayerBoard(i);
            this.playerBoards.push(pb);
            pb.init();
        }
        // Place tiles in bag, using numerical values of tile
        for (let i = 0; i < 100; i++) {
            this.tilebag.push(i % 5);
        }
        // create correct number of tiles
        this.createFactories();
        // setup for new round and set round number to 0
        this.round = -1;
        this.newRound();
    }

    newRound(): void {
        // increment round number
        this.round++;

        // pick random tiles out of the bag and place them in factories
        // Iterate through factories
        this.factory.forEach((factory, id) => {
            if (id != 0) {
                for (let i = 0; i < 4; i++) {
                    const ind = Math.floor(this.rng() * this.tilebag.length);
                    if (this.tilebag[ind] != Tile.Null) {
                        factory.push(this.tilebag[ind]);
                        this.tilebag[ind] = Tile.Null;
                    } else {
                        // try again
                        i--;
                    }
                }
            }
        });
        // set players turn
        this.activePlayer = (this.round + this.startingPlayer) % this.nPlayers;
        this.previousPlayer = (this.round + this.startingPlayer - 1) % this.nPlayers;
        this.firstTile = Tile.FirstPlayer;
        this.playedMoves = [];
        // generate move list
        this.getMoves();
        // set turn number
        this.turn = 0;
        // set state fr first turn
        this.state = State.turn;
    }

    nextTurn(): boolean {
        if (this.state != State.turnEnd) {
            throw Error("Not end of turn");
        }
        this.turn++;
        this.previousPlayer = this.activePlayer;
        this.activePlayer++;
        if (this.activePlayer == this.nPlayers) {
            this.activePlayer = 0;
        }
        // get list of moves
        this.getMoves();

        // if no moves left, finish rund
        if (this.availableMoves.length == 0) {
            // set activeplayer and turn back to previous
            // this.turn--;
            this.activePlayer = this.previousPlayer;
            this.state = State.endOfTurns;
            return false;
        } else {
            this.state = State.turn;
            return true;
        }
    }

    // Moves tiles to wall
    // Adds up scores
    // checks for game end condition
    endRound(): boolean {
        // move tiles to wall and back to bag, count up scores
        this.playerBoards.forEach((pb, i) => {
            // move tiles and get score
            pb.score += this.moveToWall(i, pb.wall);
            // move leftover tiles from lines back to bag
            pb.lines.forEach((line, linenumber) => {
                if (line.length == linenumber + 1) {
                    // move all but one to tilebag
                    for (let i = 0; i < linenumber; i++) {
                        this.tilebag.push(line[0]);
                    }
                    pb.lines[linenumber] = [];
                }
            });

            // clear floor
            pb.floor.forEach((tile) => {
                if (tile != Tile.FirstPlayer) {
                    this.tilebag.push(tile);
                }
            });
            pb.floor = [];
        });

        // check for end condition, otherwise next round
        let done = false;
        this.playerBoards.forEach((pb) => {
            pb.wall.forEach((line) => {
                if (line.filter((x) => x != Tile.Null).length == 5) {
                    done = true;
                }
            });
            if (pb.score < 0) {
                pb.score = 0;
            }
        });
        if (done) {
            this.state = State.gameEnd;
            this.playerBoards.forEach((pb) => {
                pb.score += this.wallScore(pb.wall);
            });
            // Assign winner
            let best_score = 0;
            this.playerBoards.forEach((board, id) => {
                if (board.score > best_score) {
                    this.winner = [id];
                    best_score = board.score;
                } else if (board.score == best_score) {
                    this.winner.push(id);
                }
            });
            return false;
        } else {
            this.newRound();
            return true;
        }
    }

    // populates avaialableMoves with all possible moves in current  state
    getMoves(): void {
        // Clear list of possible moves
        this.availableMoves = [];
        // Go through all the factories
        this.factory.forEach((factory, factoryid) => {
            // for each tile available in factory
            const uniquetiles = new Set(factory);
            uniquetiles.forEach((tile) => {
                // for each of the lines on the players board
                this.playerBoards[this.activePlayer].lines.forEach((line, lineNumber) => {
                    // check if tile already in wall of this type
                    if (this.playerBoards[this.activePlayer].wall[lineNumber].includes(tile)) {
                        // not a valid move
                        // Check if tile/s already in line
                    } else if (line.length > 0) {
                        // check if possible move tile matches current line
                        if (line.length < lineNumber + 1 && line[0] == tile) {
                            // is a valid move, add to list
                            this.availableMoves.push(new Move(this.activePlayer, factoryid, tile, lineNumber));
                        }
                    } else {
                        // No tiles in line, valid move
                        this.availableMoves.push(new Move(this.activePlayer, factoryid, tile, lineNumber));
                    }
                });
                // also add a move straight to the floor
                this.availableMoves.push(new Move(this.activePlayer, factoryid, tile, 5));
            });
        });

        // Add firstplayer tile straight to floor
        if (this.firstTile == Tile.FirstPlayer) {
            this.availableMoves.push(new Move(this.activePlayer, 0, Tile.FirstPlayer, 5));
        }
    }

    playMove(move: Move): void {
        if (this.state != State.turn || this.activePlayer != move.player) {
            throw Error("Invalid state for this move");
        }
        this.playedMoves.push(move);
        const pb = this.playerBoards[move.player];
        // get the tiles from the factory
        const tiles = this.factory[move.factory].filter((tile) => tile == move.tile);
        const discardtiles = this.factory[move.factory].filter((tile) => tile != move.tile);

        // if centre, set new tilelist
        if (move.factory == 0) {
            this.factory[0] = discardtiles;
            // add firstplayer tile if required.
            if (this.firstTile == Tile.FirstPlayer) {
                pb.floor.push(Tile.FirstPlayer);
                this.firstTile = Tile.Null;
            }
        } else {
            // put extra tiles in centre
            discardtiles.forEach((tile) => {
                this.factory[0].push(tile);
            });
            // clear factory
            this.factory[move.factory] = [];
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

        this.state = State.turnEnd;
    }

    // create the correct number of factories for game
    createFactories(): void {
        let n = 0;
        if (this.nPlayers == 2) {
            n = 5;
        } else if (this.nPlayers == 3) {
            n = 7;
        } else {
            n = 9;
        }
        this.factory = [[]];
        for (let i = 0; i < n; i++) {
            this.factory.push([]);
        }
    }

    moveToWall(player: number, wall: Array<Array<Tile>>): number {
        // if a line is full, puts a tile in the wall.
        // does not remove tiles from lines
        // used for evaluation and end of round
        let score = 0;
        const pb = this.playerBoards[player];

        pb.lines.forEach((line, lineindex) => {
            // check if line is full
            if (line.length == lineindex + 1) {
                // find where tile would go on wall
                const tile = line[0];
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

    // calculates the row, column and colour score for a given wall
    wallScore(wall: Array<Array<Tile>>): number {
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
    // calculate the score change for current wall state
    evalScore(player: number): number {
        // create new wall to apply changes to
        const wall = this.playerBoards[player].wall.map((line) => line.slice(0));
        const score = this.moveToWall(player, wall) + this.playerBoards[player].score + this.wallScore(wall);
        if (score > 0) {
            return score;
        } else {
            return 0;
        }
    }

    clone(): GameState {
        const gs = new GameState();
        gs.nPlayers = this.nPlayers;
        gs.tilebag = this.tilebag.slice(0);
        gs.factory = this.factory.map((factory) => factory.slice(0));
        gs.playerBoards = this.playerBoards.map((pb) => pb.clone());
        gs.availableMoves = this.availableMoves.slice(0);
        gs.playedMoves = this.playedMoves.slice(0);

        gs.firstTile = this.firstTile;
        gs.round = this.round;
        gs.turn = this.turn;
        gs.activePlayer = this.activePlayer;
        gs.startingPlayer = this.startingPlayer;
        gs.previousPlayer = this.previousPlayer;
        gs.state = this.state;
        gs.seed = this.seed;
        return gs;
    }

    smart_clone(move: Move): GameState {
        const gs = new GameState();

        gs.tilebag = this.tilebag;
        gs.factory = this.factory.map((factory, i) => {
            if (i == move.factory || i == 0) {
                return factory.slice(0);
            } else {
                return factory;
            }
        });
        gs.playerBoards = this.playerBoards.map((pb, i) => {
            if (i == this.activePlayer) {
                return pb.clone();
            } else {
                return pb;
            }
        });
        // gs.availableMoves = this.availableMoves.slice(0)
        gs.playedMoves = this.playedMoves;

        gs.nPlayers = this.nPlayers;
        gs.firstTile = this.firstTile;
        gs.round = this.round;
        gs.turn = this.turn;
        gs.activePlayer = this.activePlayer;
        gs.startingPlayer = this.startingPlayer;
        gs.previousPlayer = this.previousPlayer;
        gs.state = this.state;
        gs.seed = this.seed;
        return gs;
    }
}
