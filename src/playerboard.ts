import { Tile } from "./azul.js";

export class PlayerBoard {
    static wallTypes: Array<Array<Tile>> = [
        [Tile.Blue, Tile.Yellow, Tile.Red, Tile.Black, Tile.White],
        [Tile.White, Tile.Blue, Tile.Yellow, Tile.Red, Tile.Black],
        [Tile.Black, Tile.White, Tile.Blue, Tile.Yellow, Tile.Red],
        [Tile.Red, Tile.Black, Tile.White, Tile.Blue, Tile.Yellow],
        [Tile.Yellow, Tile.Red, Tile.Black, Tile.White, Tile.Blue],
    ];
    wall: Array<Array<Tile>> = [[], [], [], [], []];
    lines: Array<Array<Tile>> = [[], [], [], [], []];
    floor: Array<Tile> = [];
    score = 0;
    expectedScore = 0;
    turnUpdated = -4;

    static floorScores: Array<number> = [-1, -1, -2, -2, -2, -3, -3];

    constructor(public id: number) {}

    init(): void {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                this.wall[i][j] = Tile.Null;
            }
        }
    }

    clone(): PlayerBoard {
        const pb = new PlayerBoard(this.id);
        pb.lines = this.lines.map((line) => line.slice(0));
        pb.wall = this.wall.map((line) => line.slice(0));
        pb.floor = this.floor.slice(0);
        pb.score = this.score;
        pb.expectedScore = this.expectedScore;
        pb.turnUpdated = this.turnUpdated;
        return pb;
    }
}
