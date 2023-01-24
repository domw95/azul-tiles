import { GameState, PlayerBoard, Tile } from "../dist/index.js";
import { State } from "../dist/state.js";

// Check each available move to ensure they are legit
function validate_moves(gs: GameState) {
    gs.availableMoves.forEach((move) => {
        expect(move.count).toBeGreaterThan(0);
        expect(move.player).toBe(gs.activePlayer);
        expect(gs.factory[move.factory].length).toBeGreaterThan(0);

        const selection = gs.factory[move.factory].filter((x) => x == move.tile);
        expect(selection.length).toBe(move.count);

        const line = gs.playerBoards[move.player].lines[move.line];
        if (move.full) {
            expect(selection.length + line.length).toBeGreaterThan(move.line);
        }
    });
}

// Checks various parts of the gamestate
function validate_gamestate(gs: GameState) {
    // Check that 101 tiles are present in game
    const count = [0, 0, 0, 0, 0, 0];
    gs.tilebag.filter((tile) => tile != Tile.Null).forEach((tile) => (count[tile] += 1));
    gs.factory.forEach((factory) => factory.forEach((tile) => (count[tile] += 1)));
    gs.playerBoards.forEach((pb) => {
        pb.lines.forEach((line) => line.forEach((tile) => (count[tile] += 1)));
        pb.floor.forEach((tile) => (count[tile] += 1));
        pb.wall.forEach((line) =>
            line.forEach((tile) => {
                if (tile >= 0) {
                    count[tile] += 1;
                }
            }),
        );
    });
    if (gs.firstTile == Tile.FirstPlayer) {
        count[Tile.FirstPlayer] += 1;
    }
    expect(count).toEqual([20, 20, 20, 20, 20, 1]);
}

//  Call at end of round to check wall, lines, scores etc
function validate_playerboard(pb: PlayerBoard) {
    expect(pb.wall).toEqual(pb.shadowWall);
}

test("Gamestate game", () => {
    for (let n = 2; n < 5; n++) {
        // Initialise game
        const gs = new GameState();
        expect(gs.state).toBe(State.start);
        gs.newGame(n);
        expect(gs.nPlayers).toBe(n);
        expect(gs.state).toBe(State.turn);
        expect(gs.factory.length).toBe(2 * n + 2);

        // Go through entire game
        for (;;) {
            // check validity of available moves
            validate_moves(gs);
            validate_gamestate(gs);

            // Get move
            const move = gs.availableMoves[Math.floor(Math.random() * gs.availableMoves.length)];

            gs.playMove(move);
            validate_gamestate(gs);
            if (move.full) {
                expect(gs.playerBoards[gs.activePlayer].lines[move.line].length).toBe(
                    move.line + 1,
                );
            }

            expect(gs.state).toBe(State.turnEnd);
            if (!gs.nextTurn()) {
                expect(gs.state).toBe(State.endOfTurns);
                validate_gamestate(gs);
                if (!gs.endRound()) {
                    expect(gs.state).toBe(State.gameEnd);
                    gs.playerBoards.forEach((pb) => validate_playerboard(pb));
                    break;
                } else {
                    // Round ended, start of next
                    expect(gs.state).toBe(State.turn);
                    gs.playerBoards.forEach((pb) => validate_playerboard(pb));
                }
            } else {
                expect(gs.state).toBe(State.turn);
            }
        }
    }
});

test("Move generation", () => {
    // Create a known game
    const gs = new GameState();
    gs.seed = "test_seed";
    gs.newGame(2);

    expect(gs.availableMoves.length).toBe(96);

    // Play a move
    let move = gs.availableMoves.filter((move) => {
        return move.factory == 4 && move.tile == Tile.Black && move.line == 1;
    })[0];

    gs.playMove(move);
    gs.nextTurn();
    expect(gs.availableMoves.length).toBe(90);

    // Play a move
    move = gs.availableMoves.filter((move) => {
        return move.factory == 0 && move.tile == Tile.Yellow && move.line == 0;
    })[0];
    gs.playMove(move);
    gs.nextTurn();
    expect(gs.availableMoves.length).toBe(70);
});
