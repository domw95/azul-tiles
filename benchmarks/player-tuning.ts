import { PruningType, SearchMethod } from "minimaxer";
import { PlayerCompare } from "../dist/ai/gameperf.js";
import { AI, AIOpts } from "../dist/ai/ai.js";

// Noob Player
let opts = new AIOpts();
opts.depth = 1;
opts.method = SearchMethod.DEPTH;
opts.randomWeight = 1.1;
opts.config.moveAllFill = true;
opts.config.moveNoFloor = true;
const noob = new AI(0, opts);

// Beginner
opts = new AIOpts();
opts.depth = 1;
opts.method = SearchMethod.DEPTH;
opts.randomWeight = 3;
opts.config.moveAllFill = true;
opts.config.moveNoFloor = true;
opts.config.firstTileValue = 0.5;
const beginner = new AI(0, opts);

// Intermediate
opts = new AIOpts();
opts.depth = 3;
opts.method = SearchMethod.TIME;
opts.timeout = 100;
opts.randomWeight = 5;
opts.config.moveAllFill = true;
opts.config.friendly = true;
opts.config.moveNoFloor = true;
opts.config.firstTileValue = 0.5;
opts.config.quickEval = true;
opts.config.negativeScore = true;
const intermediate = new AI(0, opts);

// Competitive
opts = new AIOpts();
opts.depth = 3;
opts.method = SearchMethod.TIME;
opts.timeout = 100;
opts.randomWeight = 10;
opts.config.moveAllFill = true;
// opts.config.moveNoFloor = true;
opts.config.firstTileValue = 0.5;
opts.config.centre = 0.1;
opts.config.quickEval = true;
opts.config.negativeScore = true;
const competitive = new AI(0, opts);

// Tactical
opts = new AIOpts();
opts.depth = 3;
opts.method = SearchMethod.TIME;
opts.timeout = 100;
opts.optimal = true;
opts.config.movePruning;
// opts.config.moveAllFill = true;
opts.config.forecast = 0.1;
// opts.config.moveNoFloor = true;
opts.config.firstTileValue = 1.5;
// opts.config.centre = 0.01;
opts.config.quickEval = true;
opts.config.negativeScore = true;
const tactical = new AI(0, opts);

// Advanced
opts = new AIOpts();
// opts.depth = 3;
opts.method = SearchMethod.TIME;
opts.timeout = 100;
opts.optimal = true;
opts.config.movePruning;
// opts.config.moveAllFill = true;
opts.config.forecast = 0.1;
// opts.config.moveNoFloor = true;
opts.config.firstTileValue = 1.5;
// opts.config.centre = 0.01;
opts.config.quickEval = true;
opts.config.negativeScore = true;
const advanced = new AI(0, opts);

// Master
opts = new AIOpts();
// opts.depth = 3;
opts.method = SearchMethod.TIME;
opts.timeout = 1000;
opts.optimal = true;
opts.config.movePruning;
// opts.config.moveAllFill = true;
opts.config.forecast = 0.1;
// opts.config.moveNoFloor = true;
opts.config.firstTileValue = 1.5;
// opts.config.centre = 0.01;
opts.config.quickEval = true;
opts.config.negativeScore = true;
const master = new AI(0, opts);

const players = [advanced, tactical];
const pc = new PlayerCompare(players);
console.log(players[0]);
console.log(players[1]);
pc.compare_alternate();
