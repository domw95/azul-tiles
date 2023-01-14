import { Move } from "./azul.js";
import { PlayerBoard } from "./playerboard.js";
import { GameState } from "./state.js";

export function printGame(gs: GameState): void {
    console.log("\nGame Board\n");
    console.log("Factories");
    gs.factory.forEach((factory, i) => {
        console.log("Factory %d", i);
        console.log(factory);
    });
    console.log();
    gs.playerBoards.forEach((pb, i) => {
        console.log("\tPlayer %d", i);
        console.log("Lines");
        pb.lines.forEach((line) => {
            console.log(line);
        });
        console.log("Wall");
        pb.wall.forEach((w) => {
            console.log(w);
        });
        console.log("Floor");
        console.log(pb.floor);
        console.log();
        console.log("Score");
        console.log(pb.score);
    });
    console.log("Wall Positions");
    PlayerBoard.wallTypes.forEach((line) => {
        console.log(line);
    });
}

/** check if 2 moves are the same
 * @returns `true` if moves are the same
 */
export function compareMoves(move1: Move, move2: Move): boolean {
    if (
        move1.factory == move2.factory &&
        move1.line == move2.line &&
        move1.tile == move2.tile &&
        move1.player == move2.player
    ) {
        return true;
    } else {
        return false;
    }
}
