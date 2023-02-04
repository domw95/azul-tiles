import { SearchMethod } from "minimaxer";
import { PlayerCompare } from "../dist/ai/gameperf.js";
import { AI, AIOpts } from "../dist/ai/ai.js";

const timeout = 100;

let opts = new AIOpts();
opts.timeout = timeout;
opts.method = SearchMethod.TIME;
opts.optimal = true;
opts.config.centre = 0.1;

const player0 = new AI(0, opts);

opts = new AIOpts();
opts.timeout = timeout;
opts.method = SearchMethod.TIME;
opts.optimal = true;
opts.config.quickEval = true;
// opts.config.firstTileValue = 1;
// opts.config.tileCountValue = 0.1;
// opts.config.lineValue = 0.1;
opts.config.centre = 0.1;

const player1 = new AI(1, opts);

const players = [player0, player1];
const pc = new PlayerCompare(players);
console.log(player0);
console.log(player1);
pc.compare_alternate();
