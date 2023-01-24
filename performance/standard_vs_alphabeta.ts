import { PruningType, SearchMethod } from "minimaxer";
import { PlayerCompare } from "../dist/ai/gameperf.js";
import { AI, AIOpts } from "../dist/ai/ai.js";

const opts0 = new AIOpts();
opts0.timeout = 100;
opts0.method = SearchMethod.TIME;

const player0 = new AI(0, opts0);

const opts1 = new AIOpts();
opts1.timeout = 100;
opts1.pruning = PruningType.ALPHA_BETA;
opts1.method = SearchMethod.TIME;

const player1 = new AI(1, opts1);

const players = [player0, player1];

const pc = new PlayerCompare(players);

pc.compare_alternate();
