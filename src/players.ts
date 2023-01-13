import { evalValue, moveCompare, moveGen, movePlay, movePlaySmart } from "./ai"
import { GameState, Move } from "./azul"
import { Negamax, NegamaxOpts, NegamaxResult, PruningType} from "../minimax/negamax"
import { SearchExit, TreeNodeAim } from "../minimax/tree"
import { PlayerInterface, PlayerType} from "./game"


// Class to implement
export class AI implements PlayerInterface{
    type = PlayerType.AI
    gamestate?:GameState
    name: string = ""
    constructor(public id:number){
        
    }
    getMove(gs:GameState): Move | undefined {return undefined}
    newRound(gamestate: GameState): void {
        this.gamestate = gamestate
    }
}


function printResult(result: NegamaxResult): void {    
    if (result.exit == SearchExit.TIME){
        console.log("Timeout")
    } else if (result.exit == SearchExit.FULLDEPTH){
        console.log("Full depth")
    } else {
        console.log(result.move)
    }
    console.log("Depth:", result.depth,"Paths:",result.nPaths,
        "Value", result.value.toFixed(2))
}

// type of AI possible:
// Depth
// Time
// Deepening
// pruning none/ab
// deepening/time pruning postsort

enum NegamaxAIMode {
    DEPTH,
    TIME,
    DEEPENING
}

// Options for creating a Negamax player
class NegamaxAIOpts {
    // Options for underlying  negamax search tree
    // opt: NegamaxOpts = new NegamaxOpts()
    // Whether the tree is traversed after opponent moves
    // or created from scratch each turn
    traverse: boolean = false
    // print to console
    print: boolean = false;

    // supply underlying tree opts to constructor
    constructor(public opt: NegamaxOpts, public mode: NegamaxAIMode){

    }
}

// Base class for implemented Negamax player
// extend class for specific functions
class NegaxmaxAIBase extends AI {
    evalNodeCallback = evalValue
    moveGenCallback = moveGen
    movePlayCallback = movePlaySmart
    moveCompareCallback = moveCompare
    tree: Negamax | undefined
    constructor(id:number, public opts: NegamaxAIOpts){
        super(id)
    }


    // Create a tree using the given gamestate
    // Assign correct aim and callbacks to it
    createTree(gs:GameState): Negamax {
        // Figure out aim
        let aim = TreeNodeAim.MIN
        if (gs.activePlayer == 0){
            aim = TreeNodeAim.MAX
        }

        // configure options from supplied options
        const tree = new Negamax(gs.clone(), aim, this.opts.opt);    
        tree.evalNodeCallback = this.evalNodeCallback
        tree.moveGenCallback = this.moveGenCallback
        tree.movePlayCallback = this.movePlayCallback
        tree.moveCompareCallback = this.moveCompareCallback
        if (this.opts.print){
            tree.depthCallback = printResult
        }
        
        return tree
    }

    getMove(gs: GameState): Move | undefined {
        if (this.opts.print){
            console.log(" ====== Player %d turn ======",this.id)
        }
        var tree;
        if (this.opts.traverse){
            if (this.tree == undefined){
                throw Error("Tree is undefined")
            }
            // apply a previous move if there is one
            const move = gs.playedMoves.at(-1)
            if (move != undefined){
                this.tree?.traverse(move)
            }
            
            tree = this.tree            
        } else {
            tree = this.createTree(gs)
        }
        // get move
        const move = this._get_move(tree)
        if (this.opts.traverse){
            this.tree?.traverse(move)
        }
        return move
    }
    private _get_move(tree:Negamax): Move{
        if (this.opts.mode == NegamaxAIMode.TIME){
            return this.evalTime(tree)
        } else if (this.opts.mode == NegamaxAIMode.DEPTH){
            return this.evalDepth(tree)
        } else if (this.opts.mode == NegamaxAIMode.DEEPENING){
            return this.evalDeepening(tree)
        } else {
            throw Error("Invalid NegamaxAIMode")
        }
    }

    newRound(gamestate: GameState): void {
        this.tree = this.createTree(gamestate)
    }

    evalTime(tree: Negamax): Move {
        const result = tree.evalTime()
        if (this.opts.print){
            printResult(result)
        }
        return result.move
    } 

    evalDepth (tree: Negamax): Move{
        const result = tree.evalDepth()
        if (this.opts.print){
            printResult(result)
        }
        return result.move
    }

    evalDeepening (tree: Negamax): Move {
        const result = tree.evalDeepening()
        if (this.opts.print){
            printResult(result)
        }
        return result.move
    }

}

// For Time based tree search
// defaults to 1 second, no alphabeta or postsort
// alphabeta comes with postsort
export class NegamaxAITime extends NegaxmaxAIBase {
    
    constructor(id:number,
                print: boolean = false,
                timeout: number = 1000,                     
                alphabeta: boolean = false,
                travsere: boolean = false
                ){

        const opt = new NegamaxOpts()
        // configre timeout
        opt.timeout = timeout;
        // configure pruning
        if (alphabeta){
            opt.pruning = PruningType.ALPHABETA
            opt.postsort = -1
        } else {
            opt.pruning = PruningType.NONE
            opt.postsort = 0
        }

        const opts = new NegamaxAIOpts(opt, NegamaxAIMode.TIME)
        opts.print = print;
        opts.traverse = travsere
        super(id, opts)
        
    }      
}

export class NegamaxAIDepth extends NegaxmaxAIBase {
    constructor(id:number,
                print: boolean = false,
                depth: number = 1,
                alphabeta: boolean = false
                ) {
        
        // create options for AI
        const opt = new NegamaxOpts()
        // configre timeout
        opt.depth = depth;
        // configure pruning
        if (alphabeta){
            opt.pruning = PruningType.ALPHABETA
            opt.postsort = -1
        } else {
            opt.pruning = PruningType.NONE
            opt.postsort = 0
        }

        const opts = new NegamaxAIOpts(opt, NegamaxAIMode.DEPTH)
        opts.print = print;
        super(id, opts)
    }
}

export class NegamaxAIDeepening extends NegaxmaxAIBase {
    constructor(id:number,
                print: boolean = false,
                depth: number = 1,
                alphabeta: boolean = false
                ) {
        
        // create options for AI
        const opt = new NegamaxOpts()
        // configre timeout
        opt.depth = depth;
        // configure pruning
        if (alphabeta){
            opt.pruning = PruningType.ALPHABETA
            opt.postsort = 0
        } else {
            opt.pruning = PruningType.NONE
            opt.postsort = 0
        }

        const opts = new NegamaxAIOpts(opt, NegamaxAIMode.DEEPENING)
        opts.print = print;
        super(id, opts)
    }
}

// export class minimaxAI extends AI {
//     evalNodeValue = evalValue;
//     moveGenCallback = moveGen;
//     movePlayCallback = movePlay;

//     constructor(public gamestate:GameState,id:number){
//         super(id)
//     }

//     getMove(gs:GameState): Move | undefined {
//         console.log("============ NEW TURN ===============")
//         const tree = new GameTree(gs, TreeNodeAim.MIN);    
//         tree.evalNodeValue = this.evalNodeValue
//         tree.moveGenCallback = this.moveGenCallback;
//         tree.movePlayCallback = this.movePlayCallback

//         const move = tree.calcMinimaxABTime(5000);
//         return move;

//     }

// }
// export class minimaxAITravserse extends minimaxAI {
//     tree: GameTree
//     constructor(public gamestate:GameState,
//         id:number,
//         public timeout:number
//         ){
//         super(gamestate, id)
//         // create the tree
//         this.tree = new GameTree(gamestate.clone(), TreeNodeAim.MAX)
//         this.tree.evalNodeValue = evalValue;
//         this.tree.moveGenCallback = moveGen;
//         this.tree.movePlayCallback = movePlay;
//     }
    

//     getMove(gs:GameState): Move | undefined {
//         console.log("============ NEW TURN ===============")
//         // get the best move
//         const move = this.tree.calcMinimaxABTime(this.timeout);
//         // update the tree active root
//         this.tree.traverse(move);
//         // return the move
//         return move;
//     }

//     opMove(gs: GameState): void {
//         // get move by opponents to update tree
//         const prev = this.gamestate.playedMoves.at(-1)
//         if (prev != undefined){
//             this.tree.traverse(prev)
//         } else {
//             throw Error("Missing previous move")
//         }
//     }

//     newRound(gs: GameState): void {
//         // get a fresh tree for the new round
//         let aim = TreeNodeAim.MAX
//         if (gs.activePlayer == 1){
//             aim = TreeNodeAim.MIN
//         }
//         this.tree = new GameTree(gs.clone(), aim)
//         this.tree.evalNodeValue = evalValue;
//         this.tree.moveGenCallback = moveGen;
//         this.tree.movePlayCallback = movePlay;
//     }
// }

// export class minimaxAIMulti extends minimaxAI {
//     tree: GameTree
//     constructor(public gamestate:GameState,
//         id:number,
//         public timeout:number
//         ){
//         super(gamestate, id)
//         // create the tree
//         this.tree = new GameTree(gamestate.clone(), TreeNodeAim.MAX)
//         this.tree.evalNodeValue = evalValueMulti;
//         this.tree.evalNodeScore = evalScores;
//         this.tree.moveGenCallback = moveGen;
//         this.tree.movePlayCallback = movePlay;
//     }
    

//     getMove(gs:GameState): Move | undefined {
//         console.log("============ NEW TURN ===============")
//         // get the best move
//         const move = this.tree.calcMinimaxMulti(this.timeout);
//         // update the tree active root
//         this.tree.traverse(move);
//         // return the move
//         return move;
//     }

//     opMove(gs: GameState): void {
//         // get move by opponents to update tree
//         const prev = this.gamestate.playedMoves.at(-1)
//         if (prev != undefined){
//             this.tree.traverse(prev)
//         } else {
//             throw Error("Missing previous move")
//         }
//     }

//     newRound(gs: GameState): void {
//         // get a fresh tree for the new round
//         let aim = TreeNodeAim.MAX
//         if (gs.activePlayer == 1){
//             aim = TreeNodeAim.MIN
//         }
//         this.tree = new GameTree(gs.clone(), aim)
//         this.tree.evalNodeValue = evalValueMulti;
//         this.tree.evalNodeScore = evalScores;
//         this.tree.moveGenCallback = moveGen;
//         this.tree.movePlayCallback = movePlay;
//     }
// }