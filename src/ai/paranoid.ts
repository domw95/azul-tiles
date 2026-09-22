import * as mx from "minimaxer";
import { Move, PlayerInterface, PlayerType } from "../azul.js";
import { GameState } from "../state.js";
import { AIOpts, printResult } from "./ai.js";
import { moveFilter, NodeData } from "./callback.js";
import { evaluate } from "./evaluation.js";

export const paranoidCallback: mx.CreateChildNodeFunc<GameState, Move, NodeData> = (
    parent: mx.Node<GameState, Move, NodeData>,
    move: Move,
): mx.Node<GameState, Move, NodeData> => {
    // Clone gamestate and play move
    const gamestate = new GameState(parent.gamestate, move);
    gamestate.playMove(move);

    // Get active player
    const activePlayer = parent.gamestate.activePlayer;

    // Clone node data
    const data = new NodeData(parent.data.nplayers, parent.data);

    // Update the evaluations that need it
    for (let player = 0; player < data.nplayers; player++) {
        if (activePlayer == player || !data.updated[player] || !data.config.quickEval) {
            data.values[player] = evaluate(gamestate, undefined, player, data.config);
            data.updated[player] = true;
        }
    }

    // Check child type
    const type = gamestate.nextTurn() ? mx.NodeType.INNER : mx.NodeType.LEAF;

    // Create child. The root player picks the maximum, everyone else is assumed to be
    // playing to minimise the root player's lead
    const child = new mx.Node(
        type,
        gamestate,
        move,
        data,
        gamestate.activePlayer == data.rootPlayer ? mx.NodeAim.MAX : mx.NodeAim.MIN,
        moveFilter(gamestate, data.config),
    );
    child.activePlayer = gamestate.activePlayer;

    // Value is the root player's lead over whoever it is playing against: one chosen
    // player if there is a target, otherwise whichever opponent is doing best
    let best = -Infinity;
    for (let player = 0; player < data.nplayers; player++) {
        if (player != data.rootPlayer && data.values[player] > best) {
            best = data.values[player];
        }
    }
    let opponent = best;
    if (data.targetPlayer >= 0) {
        // Mix the target in, so a partial weight keeps playing the field as well
        opponent = (1 - data.targetWeight) * best + data.targetWeight * data.values[data.targetPlayer];
    }
    child.value = data.values[data.rootPlayer] - opponent;

    return child;
};

/**
 * Class that implements a paranoid AI player for games of any size.
 *
 * Where {@link MultiAI} searches with maxn, giving every player credit for maximising
 * their own score, this treats all the opponents as a single one playing to minimise this
 * player's lead. The model is pessimistic, but because the search is zero sum it can use
 * alpha-beta pruning, which maxn cannot, and so reaches a considerably greater depth in
 * the same time.
 *
 * Set {@link AIOpts.pruning} to {@link mx.PruningType.ALPHA_BETA} to get the benefit;
 * {@link AIOpts.optimal} has no effect here, as it is a negamax only option.
 *
 * Passing a `target` narrows what it plays for: instead of its lead over the field it
 * maximises its lead over that one player, which makes it hound them specifically.
 */
export class ParanoidAI implements PlayerInterface {
    type = PlayerType.AI;
    name = "";

    /**
     * @param id Player index, must correspond with gamestate index
     * @param opts Configuration options
     * @param target Player to play against, rather than whichever opponent is doing
     * best. Set this to a human's index for a player that cares only about finishing
     * above them, and is happy to let everyone else past in the process.
     * @param targetWeight How much to play the target rather than the field, between `0`
     * and `1`. A partial weight hounds the target while still playing a sound game.
     */
    constructor(public id: number, public opts: AIOpts, public target = -1, public targetWeight = 1) {}

    /**
     * Function called when the game requires the AI to pick a move
     * @param gamestate
     * @returns
     */
    getMove(gamestate: GameState): Move | undefined {
        if (this.opts.print) {
            console.log(" ====== Player %d turn ======", this.id);
        }

        // Node data has to know which player the search is for
        const data = new NodeData(gamestate.nPlayers);
        data.rootPlayer = this.id;
        data.targetPlayer = this.target == this.id ? -1 : this.target;
        data.targetWeight = this.targetWeight;
        data.config = this.opts.config;

        // Create root node, which is always the maximising player
        const root = new mx.Node(
            mx.NodeType.ROOT,
            gamestate.clone(),
            new Move(0, 0, 0, 0),
            data,
            mx.NodeAim.MAX,
            moveFilter(gamestate, this.opts.config),
        );
        root.activePlayer = gamestate.activePlayer;

        // Create tree and assign callback
        const tree = new mx.Minimax(root, this.opts);
        tree.CreateChildNode = paranoidCallback;

        if (this.opts.print) {
            tree.depthCallback = (
                tree: mx.Minimax<GameState, Move, NodeData>,
                result: mx.MinimaxResult<Move>,
            ): void => {
                printResult(result);
            };
        }

        // Get the result
        const result = tree.evaluate();
        if (this.opts.print) {
            console.log(result);
        }
        return result.move;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    newRound(gs: GameState): void {}
}
