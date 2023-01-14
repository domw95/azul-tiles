import { PruningType } from "minimaxer";
import { PlayerCompare } from "../dist/ai/gameperf.js";
import { AI, AIMode, AIOpts } from "../dist/ai/players.js";

const opts0 = new AIOpts();
opts0.timeout = 100;
opts0.mode = AIMode.TIME;

const player0 = new AI(0, opts0);

const opts1 = new AIOpts();
opts1.timeout = 100;
opts1.pruning = PruningType.ALPHA_BETA;
opts1.mode = AIMode.TIME;

const player1 = new AI(1, opts1);

const players = [player0, player1];

const pc = new PlayerCompare(players);

pc.compare_alternate();
