import * as mx from "minimaxer";
import { Move, PlayerInterface, PlayerType } from "../azul.js";
import { PlayerBoard } from "../playerboard.js";
import { GameState } from "../state.js";
import { AIOpts, printResult } from "./ai.js";
import { moveFilter, multiplayerCallback, NodeData } from "./callback.js";

/** Class that implements the multiplayer maxn AI player */
export class MultiAI implements PlayerInterface {
    type = PlayerType.AI;
    name = "";

    /**
     *
     * @param id Player index, must correspond with gamestate index
     * @param opts Configuration options
     */
    constructor(public id: number, public opts: AIOpts) {}

    /**
     *  Function called when game requires the AI to picks  move
     * @param gamestate
     * @returns
     */
    getMove(gamestate: GameState): Move | undefined {
        if (this.opts.print) {
            console.log(" ====== Player %d turn ======", this.id);
        }

        // Create root node
        const root = new mx.Node(
            mx.NodeType.ROOT,
            gamestate.clone(),
            new Move(0, 0, 0, 0),
            new NodeData(gamestate.nPlayers),
            undefined,
            moveFilter(gamestate, this.opts.config),
        );
        // Set active player for root
        root.activePlayer = gamestate.activePlayer;
        // Set config on data
        root.data.config = this.opts.config;
        // Create tree
        const tree = new mx.Maxn(root, this.opts);
        // Assign callback to tree
        tree.CreateChildNode = multiplayerCallback;

        if (this.opts.print) {
            tree.depthCallback = (
                tree: mx.Negamax<GameState, Move, NodeData>,
                result: mx.NegamaxResult<Move>,
            ): void => {
                printResult(result);
            };
        }

        // Get the result
        const result = tree.evaluate();
        // console.log(tree.activeRoot);
        if (this.opts.print) {
            // printResult(result);
            console.log(result);
        }
        // Return move
        const pb = tree.root.child?.gamestate.playerBoards[this.id] as PlayerBoard;
        console.log("Score", pb.score, "Round", pb.roundScore, "Bonus", pb.bonusScore);
        return result.move;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    newRound(gs: GameState): void {}
}
