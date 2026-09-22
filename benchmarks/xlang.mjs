// Cross-language benchmark: the TypeScript half.
//
// Mirrors `benches/xlang.rs` in azul-tiles-rs move for move, so the two
// numbers can be put side by side. Positions cannot be identical across the
// two implementations (the shufflers differ), so the harness draws from the
// same distribution instead: the same seeds, the same number of random plies,
// the same move-selection rule, and enough positions that the mean is stable.
//
//   node benchmarks/xlang.mjs [playout|fixed|deepen|timed|all]

import { GameState } from "../dist/state.js";
import { Move } from "../dist/azul.js";
import { generalCallback, NodeData, moveFilter } from "../dist/ai/callback.js";
import { EvalConfig } from "../dist/ai/evaluation.js";
import * as mx from "minimaxer";

// Erased const enums: the values, not the names.
const NODE_ROOT = 0;
const AIM_MAX = 1, AIM_MIN = -1;
const METHOD_DEPTH = 0, METHOD_DEEPENING = 2, METHOD_TIME = 3;
const PRUNE_ALPHA_BETA = 1;

/** The same LCG as the Rust side, so both draw the same ply counts and indices. */
class Lcg {
    constructor(seed) { this.s = BigInt.asUintN(64, BigInt(seed)); }
    next() {
        this.s = BigInt.asUintN(64, this.s * 6364136223846793005n + 1442695040888963407n);
        return Number(this.s >> 33n);
    }
}

/** A reproducible mid-game position, reached by playing `plies` random moves. */
function position(seed, plies) {
    const gs = new GameState();
    gs.seed = String(seed);
    gs.newGame(2);
    const rng = new Lcg(BigInt.asUintN(64, BigInt(seed) ^ 0x9e3779b97f4a7c15n));
    for (let i = 0; i < plies; i++) {
        const moves = gs.availableMoves;
        if (moves.length === 0) {
            if (!gs.endRound()) break;
            continue;
        }
        gs.playMove(moves[rng.next() % moves.length]);
        if (!gs.nextTurn()) {
            if (!gs.endRound()) break;
        }
    }
    if (gs.availableMoves.length === 0) gs.endRound();
    return gs;
}

const N_POSITIONS = Number(process.env.N_POS ?? 16);
function positions() {
    const out = [];
    for (let s = 0; s < N_POSITIONS; s++) out.push(position(s * 7919 + 13, 4 + (s % 5) * 3));
    return out;
}

/** One search from `gs`, timed. Returns [nodes, ms, value, depth]. */
function search(gs, opts) {
    const config = new EvalConfig();
    const aim = gs.activePlayer === 0 ? AIM_MAX : AIM_MIN;
    const root = new mx.Node(
        NODE_ROOT, gs.clone(), new Move(0, 0, 0, 0),
        new NodeData(gs.nPlayers), aim, moveFilter(gs, config),
    );
    root.data.config = config;
    root.data.rootPlayer = gs.activePlayer;
    const tree = new mx.Negamax(root, opts);
    tree.CreateChildNode = generalCallback;
    const t = process.hrtime.bigint();
    const r = tree.evaluate();
    const ms = Number(process.hrtime.bigint() - t) / 1e6;
    return [r.nodes, ms, r.value, r.depth];
}

function makeOpts(f) {
    const o = new mx.NegamaxOpts();
    o.pruning = PRUNE_ALPHA_BETA;
    o.genBased = true;
    f(o);
    return o;
}

/** Full random games: move generation, move application and round handling. */
function playout(nGames) {
    let moves = 0, offered = 0, t = process.hrtime.bigint();
    for (let seed = 1; seed <= nGames; seed++) {
        const gs = new GameState();
        gs.seed = String(seed);
        gs.newGame(2);
        const rng = new Lcg(BigInt.asUintN(64, BigInt(seed) ^ 0x9e3779b97f4a7c15n));
        for (;;) {
            const avail = gs.availableMoves;
            if (avail.length === 0) { if (!gs.endRound()) break; else continue; }
            offered += avail.length;
            gs.playMove(avail[rng.next() % avail.length]);
            moves++;
            if (!gs.nextTurn()) { if (!gs.endRound()) break; }
        }
    }
    const ms = Number(process.hrtime.bigint() - t) / 1e6;
    console.log(`playout    games=${nGames} moves=${moves} ms=${ms.toFixed(1)} moves_per_sec=${(moves / ms * 1000).toFixed(0)} branching=${(offered / moves).toFixed(2)}`);
}

function sweep(label, depths, optFn) {
    for (const d of depths) {
        let nodes = 0, ms = 0, checksum = 0, depthSum = 0;
        for (const gs of positions()) {
            const [n, t, v, dep] = search(gs, optFn(d));
            nodes += n; ms += t; checksum = (checksum * 31 + Math.round(v * 1000)) % 1e12; depthSum += dep;
        }
        console.log(
            `${label.padEnd(10)} depth=${d} nodes=${String(nodes).padStart(10)}` +
            ` ms=${ms.toFixed(1).padStart(9)} knodes_per_sec=${(nodes / ms).toFixed(0).padStart(6)}` +
            ` checksum=${checksum}`,
        );
    }
}

/** Fixed wall-clock budget per position: how deep does each implementation get? */
function timed(budgetMs) {
    let nodes = 0, ms = 0, depthSum = 0;
    const ps = positions();
    for (const gs of ps) {
        const [n, t, , dep] = search(gs, makeOpts((o) => {
            o.method = METHOD_TIME;
            o.timeout = budgetMs;
            o.presort = true;
        }));
        nodes += n; ms += t; depthSum += dep;
    }
    console.log(
        `timed      budget=${budgetMs}ms mean_depth=${(depthSum / ps.length).toFixed(2)}` +
        ` nodes=${nodes} ms=${ms.toFixed(1)} knodes_per_sec=${(nodes / ms).toFixed(0)}`,
    );
}

/** Give the TypeScript engine its best shot: which option set is fastest here? */
function tuned(depth) {
    const variants = [
        ["plain", (o) => { o.method = METHOD_DEPTH; o.depth = depth; o.genBased = false; }],
        ["genBased", (o) => { o.method = METHOD_DEPTH; o.depth = depth; }],
        ["optimal", (o) => { o.method = METHOD_DEPTH; o.depth = depth; o.optimal = true; }],
        ["deepen+presort", (o) => { o.method = METHOD_DEEPENING; o.depth = depth; o.presort = true; }],
        ["deepen+optimal", (o) => { o.method = METHOD_DEEPENING; o.depth = depth; o.optimal = true; }],
    ];
    const only = process.argv[4];
    for (const [name, f] of variants.filter(([n]) => !only || n === only)) {
        let nodes = 0, ms = 0;
        for (const gs of positions()) {
            const [n, t] = search(gs, makeOpts(f));
            nodes += n; ms += t;
        }
        console.log(`tuned ${name.padEnd(16)} depth=${depth} nodes=${String(nodes).padStart(10)} ms=${ms.toFixed(1).padStart(9)} knodes_per_sec=${(nodes / ms).toFixed(0)}`);
    }
}

/** Warm the JIT before anything is timed. The Rust half runs the same thing so
 *  the two harnesses stay line for line, where it costs a few milliseconds. */
function warmup() {
    for (let seed = 9001; seed < 9021; seed++) {
        const gs = new GameState();
        gs.seed = String(seed);
        gs.newGame(2);
        const rng = new Lcg(BigInt(seed));
        for (;;) {
            const avail = gs.availableMoves;
            if (avail.length === 0) { if (!gs.endRound()) break; else continue; }
            gs.playMove(avail[rng.next() % avail.length]);
            if (!gs.nextTurn()) { if (!gs.endRound()) break; }
        }
    }
    for (let s = 0; s < 4; s++) {
        search(position(s * 104729 + 7, 6), makeOpts((o) => { o.method = METHOD_DEPTH; o.depth = 3; }));
        search(position(s * 104729 + 7, 6), makeOpts((o) => { o.method = METHOD_DEEPENING; o.depth = 3; o.presort = true; }));
    }
}

warmup();
const mode = process.argv[2] ?? "all";
if (mode === "tuned") tuned(Number(process.argv[3] ?? 5));
if (mode === "playout" || mode === "all") playout(Number(process.argv[3] ?? 200));
if (mode === "fixed" || mode === "all") {
    sweep("fixed", [3, 4, 5], (d) => makeOpts((o) => { o.method = METHOD_DEPTH; o.depth = d; }));
}
if (mode === "deepen" || mode === "all") {
    sweep("deepen", [3, 4, 5], (d) => makeOpts((o) => {
        o.method = METHOD_DEEPENING; o.depth = d; o.presort = true;
    }));
}
if (mode === "timed" || mode === "all") timed(Number(process.argv[3] ?? 100));
