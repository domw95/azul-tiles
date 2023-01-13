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
