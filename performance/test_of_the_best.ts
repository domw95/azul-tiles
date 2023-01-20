import { PruningType, SearchMethod } from "minimaxer";
import { PlayerCompare } from "../dist/ai/gameperf.js";
import { AI, AIOpts, CloneMethod, EvalMethod } from "../dist/ai/players.js";
let opts = new AIOpts();
opts.timeout = 100;
opts.method = SearchMethod.TIME;
opts.clone = CloneMethod.STANDARD;
opts.genBased = true;
opts.presort = true;
opts.eval = EvalMethod.STANDARD;
opts.pruning = PruningType.ALPHA_BETA;

const player0 = new AI(0, opts);

opts = structuredClone(opts);
opts.eval = EvalMethod.GENERAL;
// opts.clone = CloneMethod.SMART;

const player1 = new AI(1, opts);

const players = [player0, player1];
const pc = new PlayerCompare(players);
console.log(player0);
console.log(player1);
pc.compare_alternate();
