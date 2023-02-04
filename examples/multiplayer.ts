import { MultiAI, GameState, AIOpts, SearchMethod } from "../dist/index.js";

const game = new GameState();

game.newGame(4);

const opts = new AIOpts();
opts.print = true;
opts.method = SearchMethod.TIME;
opts.timeout = 1000;

for (let i = 0; ; i++) {
    // Make a player
    const player = new MultiAI(game.activePlayer, opts);
    const move = player.getMove(game);
    console.log("move", move);
    if (move != undefined) {
        game.playMove(move);
        if (!game.nextTurn()) {
            console.log();
            console.log("=========== End of round ==========");
            console.log();
            if (!game.endRound()) {
                console.log();
                console.log("========== End of game ===========");
                console.log();
                break;
            }
        }
    } else {
        console.log(player);
        console.log(game);
        throw Error("Move undefined");
    }
}
