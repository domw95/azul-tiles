// Main entry point to module
// rexport subfiles from here

export * from "./game.js";
export * from "./state.js";

/** All the types of tiles availabe in the game */
export enum Tile {
    Blue,
    Yellow,
    Red,
    Black,
    White,
    /** Only exists in centre or on a players floor */
    FirstPlayer,
    /** For Walls and tilebag to indicate no tile present */
    Null = -1,
}

/** A move that can be performed in the game */
export class Move {
    constructor(public player: number, public factory: number, public tile: Tile, public line: number) {}
}

// function printGame(gs:GameState): void {
//     console.log("\nGame Board\n")
//     console.log("Factories")
//     gs.factory.forEach((factory,i) => {
//         console.log("Factory %d",i)
//         console.log(factory)
//     });
//     console.log();
//     gs.playerBoards.forEach((pb,i) => {
//         console.log("\tPlayer %d",i)
//         console.log("Lines")
//         pb.lines.forEach(line => {
//             console.log(line)
//         });
//         console.log("Wall")
//         pb.wall.forEach(w => {
//             console.log(w)
//         });
//         console.log("Floor")
//         console.log(pb.floor)
//         console.log()
//     });
//     console.log("Wall Positions")
//     PlayerBoard.wallTypes.forEach(line =>{
//         console.log(line)
//     })
// }
