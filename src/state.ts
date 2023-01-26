import seedrandom from "seedrandom";
import { Move, Tile } from "./azul.js";
import { PlayerBoard, moveToWall, wallScore } from "./playerboard.js";

/** Tracks state of the game */
export enum State {
    /** Set when {@link GameState} is constructed */
    start,
    /** Ready to accept a move from a player */
    turn,
    /** Player has just played a move */
    turnEnd,
    /** No more turns can be played this round */
    endOfTurns,
    /** Tiles have been moved and scores have been calculated for round */
    roundEnd,
    /** Game finished, with final scores and winner available */
    gameEnd,
}

/** Full representation of the azul game */
export class GameState {
    /** Holds all the tiles which are dealt to factories */
    tilebag: Array<Tile> = [];
    /** Array of factories to hold tiles. Factory[0] is centre */
    factory: Array<Array<Tile>>;
    /** If equal to  {@link azul.Tile.FirstPlayer}, first player tile is in centre*/
    firstTile: Tile = Tile.FirstPlayer;
    /** Array that holds the players board state */
    playerBoards: Array<PlayerBoard>;
    /** List of moves available to current player */
    availableMoves: Array<Move> = [];
    /** List of moves played in this round */
    playedMoves: Array<Move> = [];
    /** Number of players in the game */
    nPlayers = 0;

    round = 0;
    turn = 0;
    activePlayer = 0;
    startingPlayer = 0;
    previousPlayer = 0;
    /** Index of winning player/s. */
    winner: Array<number> = [];

    state: State = State.start;

    /** Used to generate a random game */
    rng: seedrandom.PRNG;
    seed: string;

    /**
     *
     * @param seed Seed the random number generator to play a specific game. Random otherwise
     */
    constructor(gamestate?: GameState, move?: Move) {
        if (gamestate !== undefined && move !== undefined) {
            this.factory = new Array(gamestate.factory.length) as Tile[][];
            for (let i = 0; i < gamestate.factory.length; i++) {
                if (i == move.factory || i == 0) {
                    this.factory[i] = gamestate.factory[i].slice(0);
                } else {
                    this.factory[i] = gamestate.factory[i];
                }
            }

            this.playerBoards = new Array(gamestate.playerBoards.length) as PlayerBoard[];
            for (let i = 0; i < this.playerBoards.length; i++) {
                if (i == gamestate.activePlayer) {
                    this.playerBoards[i] = new PlayerBoard(i, gamestate.playerBoards[i], move);
                } else {
                    this.playerBoards[i] = gamestate.playerBoards[i];
                }
            }

            // gs.availableMoves = this.availableMoves.slice(0)
            // gs.playedMoves = this.playedMoves;

            this.nPlayers = gamestate.nPlayers;
            this.firstTile = gamestate.firstTile;
            this.round = gamestate.round;
            this.turn = gamestate.turn;
            this.activePlayer = gamestate.activePlayer;
            this.startingPlayer = gamestate.startingPlayer;
            this.previousPlayer = gamestate.previousPlayer;
            this.state = gamestate.state;
            this.seed = gamestate.seed;
            this.rng = gamestate.rng;
        } else {
            this.factory = [];
            this.playerBoards = [];
            this.seed = Math.random().toString();
            this.rng = seedrandom();
        }
    }

    /**
     * Starts a new game, new round, ready for first turn
     * @param nPlayers Number of players to play game with
     */
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
        // create factories
        this.createFactories();
        // setup for new round and set round number to 0
        this.round = -1;
        this.newRound();
    }

    /**
     * Picks random tiles from bag and places in factories
     * Updates state (player turns etc)
     * Gets moves for first turn
     * Returns with state {@link state.State.turn}
     */
    private newRound(): void {
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
        this.tilebag = this.tilebag.filter((tile) => tile != Tile.Null);
        // set players turn
        // this.activePlayer = (this.round + this.startingPlayer) % this.nPlayers;
        // this.previousPlayer = (this.round + this.startingPlayer - 1) % this.nPlayers;
        this.firstTile = Tile.FirstPlayer;
        this.playedMoves = [];
        // generate move list
        this.getMoves();
        // set turn number
        this.turn = 0;
        // set state for first turn
        this.state = State.turn;
        this.playerBoards.forEach((pb) => {
            pb.turnUpdated = -4;
        });
    }

    /**
     * Function to be called after a player has played a move
     * Either goes to {@link state.State.turn} state or {@link state.State.endOfTurns} if no moves left
     * Generates list of moves for next turn
     * @returns `true` if another turn is available, `false` if end of turns
     */
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

        // if no moves left, finish round
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

    /**
     * Function to be called when in {@link state.State.endOfTurns} state
     * Moves tiles, calculates score and checks for game end condition
     * @returns `true` if another round is about to start, `false` if end of game
     */
    endRound(): boolean {
        // move tiles to wall and back to bag, count up scores
        this.playerBoards.forEach((pb, i) => {
            // Check who goes first next round
            if (pb.floor[0] == Tile.FirstPlayer) {
                this.activePlayer = i;
            }
            // move tiles and get score
            pb.score += moveToWall(pb, pb.wall);
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
            pb.roundScore = 0;
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
                pb.score += wallScore(pb.wall);
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

    /**
     * Populates the {@link GameState.availableMoves} list with all possible moves for this player
     */
    getMoves(): void {
        // Clear list of possible moves
        this.availableMoves = [];
        // Go through all the factories
        for (let factoryid = 0; factoryid < this.factory.length; factoryid++) {
            // for each tile available in factory
            const counts = [0, 0, 0, 0, 0];
            for (const tile of this.factory[factoryid]) {
                counts[tile] += 1;
            }
            for (let tile = 0; tile < 5; tile++) {
                if (!counts[tile]) {
                    continue;
                }
                // for each of the lines on the players board
                for (let lineNumber = 0; lineNumber < 5; lineNumber++) {
                    // check if tile already in wall of gs type
                    const line = this.playerBoards[this.activePlayer].lines[lineNumber];
                    if (
                        this.playerBoards[this.activePlayer].wall[lineNumber][
                            PlayerBoard.wallLocations[lineNumber][tile]
                        ] != Tile.Null
                    ) {
                        // not a valid move
                        // Check if tile/s already in line
                    } else if (line.length > 0) {
                        // check if possible move tile matches current line
                        const space = lineNumber + 1 - line.length;
                        if (space && line[0] == tile) {
                            // is a valid move, add to list
                            this.availableMoves.push(
                                new Move(
                                    this.activePlayer,
                                    factoryid,
                                    tile,
                                    lineNumber,
                                    counts[tile],
                                    space <= counts[tile],
                                ),
                            );
                        }
                    } else {
                        // No tiles in line, valid move
                        this.availableMoves.push(
                            new Move(
                                this.activePlayer,
                                factoryid,
                                tile,
                                lineNumber,
                                counts[tile],
                                counts[tile] >= lineNumber + 1,
                            ),
                        );
                    }
                }
                // also add a move straight to the floor
                this.availableMoves.push(
                    new Move(this.activePlayer, factoryid, tile, 5, counts[tile]),
                );
            }
        }
    }

    /**
     *  Moves selected tiles from factory to players line and/or floor.
     *  Spare tiles may go to centre factory.
     * @param move Valid move from {@link GameState.availableMoves} that is applied to the game
     */
    playMove(move: Move): number {
        if (this.state != State.turn || this.activePlayer != move.player) {
            throw Error("Invalid state for this move");
        }
        let score = 0;
        this.playedMoves.push(move);
        const pb = this.playerBoards[move.player];
        // get the tiles from the factory
        const discardtiles = this.factory[move.factory].filter((tile) => tile != move.tile);

        // if centre, set new tilelist
        if (move.factory == 0) {
            this.factory[0] = discardtiles;
            // add firstplayer tile if required.
            if (this.firstTile == Tile.FirstPlayer) {
                pb.floor.push(Tile.FirstPlayer);
                score -= 1;
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
        if (move.line != 5) {
            for (let i = 0; i < move.count; i++) {
                const length = pb.lines[move.line].length;
                if (length <= move.line) {
                    pb.lines[move.line].push(move.tile);
                } else {
                    pb.floor.push(move.tile);
                    if (pb.floor.length < 8) {
                        score += PlayerBoard.floorScores[pb.floor.length - 1];
                    }
                }
            }
        } else {
            for (let i = 0; i < move.count; i++) {
                pb.floor.push(move.tile);
                if (pb.floor.length < 8) {
                    score += PlayerBoard.floorScores[pb.floor.length - 1];
                }
            }
        }

        // Play shadow wall move if line is full
        if (move.full) {
            // Clear played tiles on shadow wall
            for (let row = 0; row < 5; row++) {
                if (pb.lines[row].length == row + 1) {
                    // clear shadow tile
                    const col = PlayerBoard.wallLocations[row][pb.lines[row][0]];
                    pb.shadowWall[row][col] = Tile.Null;
                }
            }
            score = moveToWall(pb, pb.shadowWall) - pb.roundScore;
            pb.bonusScore = wallScore(pb.shadowWall);
        }
        pb.roundScore += score;
        this.state = State.turnEnd;
        return score;
    }

    /**
     * Create factories according to number of players in game
     */
    private createFactories(): void {
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

    /**
     *
     * @param player Player to evaluate score of
     * @returns The total score the player would have if the round ended now
     */
    evalScore(player: number): number {
        // create new wall to apply changes to
        const wall = this.playerBoards[player].wall.map((line) => line.slice(0));
        const score =
            moveToWall(this.playerBoards[player], wall) +
            this.playerBoards[player].score +
            wallScore(wall);
        if (score > 0) {
            return score;
        } else {
            return 0;
        }
    }

    /**
     * Fast cloning of gamestate
     * @returns Clone of this GameState
     */
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

    /**
     * Tries to only clone objects that are going to change due to the move being played
     * Should use less memory than clone
     * @param move Move that is to be played for clone
     * @returns Clone of the current gamestate
     */
    smartClone(move: Move): GameState {
        const gs = new GameState();

        // gs.tilebag = this.tilebag;
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
        // gs.playedMoves = this.playedMoves;

        gs.nPlayers = this.nPlayers;
        gs.firstTile = this.firstTile;
        gs.round = this.round;
        gs.turn = this.turn;
        gs.activePlayer = this.activePlayer;
        gs.startingPlayer = this.startingPlayer;
        gs.previousPlayer = this.previousPlayer;
        gs.state = this.state;
        // gs.seed = this.seed;
        return gs;
    }

    /**
     * Creates a new gamestate, cloning the minimum possible properties from this
     * @param move Move about to played to cloned gamestate
     * @returns a cloned gamestate
     */
    tinyClone(move: Move): GameState {
        const gs = new GameState();

        // gs.tilebag = this.tilebag;
        gs.factory = new Array(this.factory.length) as Tile[][];
        for (let i = 0; i < this.factory.length; i++) {
            if (i == move.factory || i == 0) {
                gs.factory[i] = this.factory[i].slice(0);
            } else {
                gs.factory[i] = this.factory[i];
            }
        }

        gs.playerBoards = new Array(this.playerBoards.length) as PlayerBoard[];
        for (let i = 0; i < this.playerBoards.length; i++) {
            if (i == this.activePlayer) {
                gs.playerBoards[i] = this.playerBoards[i].tinyClone(move);
            } else {
                gs.playerBoards[i] = this.playerBoards[i];
            }
        }

        // gs.availableMoves = this.availableMoves.slice(0)
        // gs.playedMoves = this.playedMoves;

        gs.nPlayers = this.nPlayers;
        gs.firstTile = this.firstTile;
        gs.round = this.round;
        gs.turn = this.turn;
        gs.activePlayer = this.activePlayer;
        gs.startingPlayer = this.startingPlayer;
        gs.previousPlayer = this.previousPlayer;
        gs.state = this.state;
        // gs.seed = this.seed;
        return gs;
    }
}
