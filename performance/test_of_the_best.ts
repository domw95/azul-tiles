import { PruningType } from "minimaxer";
import { PlayerCompare } from "../dist/ai/gameperf.js";
import { AI, AIMode, AIOpts, CloneMethod, EvalMethod } from "../dist/ai/players.js";

let opts = new AIOpts();
opts.timeout = 100;
opts.mode = AIMode.TIME;
opts.clone = CloneMethod.SMART;
opts.genBased = true;
opts.presort = true;
opts.eval = EvalMethod.STANDARD;

const player0 = new AI(0, opts);

opts = structuredClone(opts);
opts.eval = EvalMethod.LINE;
const player1 = new AI(1, opts);

const players = [player0, player1];

const pc = new PlayerCompare(players);

pc.compare_alternate();
