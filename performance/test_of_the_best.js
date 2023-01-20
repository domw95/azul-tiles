import { PlayerCompare } from "../dist/ai/gameperf.js";
import { AI, AIOpts } from "../dist/ai/players.js";
let opts = new AIOpts();
opts.timeout = 100;
opts.method = 3 /* SearchMethod.TIME */;
opts.clone = 1 /* CloneMethod.SMART */;
opts.genBased = true;
opts.presort = true;
opts.eval = 0 /* EvalMethod.STANDARD */;
opts.pruning = 1 /* PruningType.ALPHA_BETA */;
const player0 = new AI(0, opts);
opts = structuredClone(opts);
opts.eval = 4 /* EvalMethod.GENERAL */;
const player1 = new AI(1, opts);
const players = [player0, player1];
const pc = new PlayerCompare(players);
pc.compare_alternate();