import { AI, AIMode, AIOpts, CloneMethod, PlayerCompare, PruningType } from "../dist/index.js";

const opts0 = new AIOpts();
opts0.timeout = 100;
opts0.pruning = PruningType.ALPHA_BETA;
opts0.genBased = true;
opts0.presort = true;
opts0.mode = AIMode.TIME;

const player0 = new AI(0, opts0);
player0.name = "Standard";

const opts1 = new AIOpts();
opts1.timeout = 100;
opts1.pruning = PruningType.ALPHA_BETA;
opts1.genBased = true;
opts1.presort = true;
opts1.mode = AIMode.TIME;
// opts1.eval = EvalMethod.CENTRE;
opts1.clone = CloneMethod.SMART;

const player1 = new AI(1, opts1);
player1.name = "Centre";
const players = [player0, player1];

const pc = new PlayerCompare(players);

pc.compare_alternate();
