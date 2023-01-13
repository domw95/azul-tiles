// Modules contains common function for AI players to use

import { TreeNode, TreeBranch, TreeNodeType } from '../minimax/tree';
import {GameState,Move, PlayerBoard, Tile } from './azul'


// Negamax (2 Player) value evaluation
// Player 0 +ve, Player 1 -ve
export function evalValue(node:TreeNode): number {
    return node.gamestate.evalScore(0) - node.gamestate.evalScore(1)
}

export function evalValueSimple(node:TreeNode): number {
    let gs = node.gamestate as GameState;
    if (gs.round > 4){
        return node.gamestate.evalScore(0) - node.gamestate.evalScore(1)
    }
    return evalScoreSimple(gs, 0) - evalScoreSimple(gs, 1)
}

function evalScoreSimple(gs: GameState, player: number): number {
    let wall = gs.playerBoards[player].wall.map(line => line.slice(0))
    let score =  gs.moveToWall(player, wall) + gs.playerBoards[player].score;
    if (score > 0){
        return score
    } else {
        return 0
    }

}

export function evalValueQuick(node:TreeNode): number {
    const gs = node.gamestate as GameState
    // Player that just performed move to get to this state
    const player = gs.previousPlayer
    const other = player ^ 1
    // Update score from most recent player
    gs.playerBoards[player].expectedScore = gs.evalScore(player)
    gs.playerBoards[player].turnUpdated = gs.turn
    // Check if opponent needs updating
    if (gs.turn - gs.playerBoards[other].turnUpdated > 1){
        gs.playerBoards[other].expectedScore = gs.evalScore(other)
        gs.playerBoards[other].turnUpdated = gs.turn
    }
    return gs.playerBoards[0].expectedScore - gs.playerBoards[1].expectedScore

}

export function evalValueV2(node:TreeNode): number {
    return expectedScoreV2(node.gamestate, 0) - expectedScoreV2(node.gamestate, 1) 
}

export function evalValueQuickV2(node:TreeNode): number {
    const gs = node.gamestate as GameState
    // Player that just performed move to get to this state
    const player = gs.previousPlayer
    const other = player ^ 1
    // Update score from most recent player
    gs.playerBoards[player].expectedScore = expectedScoreV2(gs, player)
    gs.playerBoards[player].turnUpdated = gs.turn
    // Check if opponent needs updating
    if (gs.turn - gs.playerBoards[other].turnUpdated > 1){
        gs.playerBoards[other].expectedScore = expectedScoreV2(gs, other)
        gs.playerBoards[other].turnUpdated = gs.turn
    }
    return gs.playerBoards[0].expectedScore - gs.playerBoards[1].expectedScore
}


function expectedScoreV2(gs: GameState, player: number) : number{
    const round_weight = (4-gs.round)/4
    // Get the 
    const pb = gs.playerBoards[player]
    let wall = pb.wall.map(line => line.slice(0))
    let score =  gs.moveToWall(player, wall) + pb.score
    if (score < 0){
        score = 0
    }
    let exp_score = 0
    // row scores
    wall.forEach((row, n) => {
        // check if full row
        const len = row.filter(x => x!=Tile.Null).length
        if (len == 5){
            score += 2
        } else if (gs.round == len){
            exp_score += 2*round_weight
        }
    });

    // column scores
    for (var j=0; j<5; j++){
        let count = 0
        let weight = 0
        for (var i=0; i<5 ;i++){
            if (wall[i][j] != Tile.Null){
                count ++
                weight += i+1
            }
        }
        if (count== 5){
            score += 7;
        } else {
            exp_score += (weight/15)*7*round_weight
        }

    }

    // colour scores
    [Tile.Red,Tile.Yellow,Tile.Black,Tile.Blue,Tile.White].forEach(tile =>{
        // go through to find wall positions
        let count = 0
        let weight = 0
        for (var i=0; i<5 ;i++){
            for (var j=0; j<5; j++){
                if (PlayerBoard.wallTypes[i][j] == tile){
                    if (wall[i][j] == tile){
                        count ++
                        weight += i+1
                    }
                }
            }
        }
        if (count == 5){
            score += 10
        } else {
            exp_score += (weight/15)*10*round_weight
        }

    })
    return score + exp_score
}

export function evalValueQuickV3(node:TreeNode): number {
    const gs = node.gamestate as GameState
    // Player that just performed move to get to this state
    const player = gs.previousPlayer
    const other = player ^ 1
    // Update score from most recent player
    gs.playerBoards[player].expectedScore = expectedScoreV3(gs, player)
    gs.playerBoards[player].turnUpdated = gs.turn
    // Check if opponent needs updating
    if (gs.turn - gs.playerBoards[other].turnUpdated > 1){
        gs.playerBoards[other].expectedScore = expectedScoreV3(gs, other)
        gs.playerBoards[other].turnUpdated = gs.turn
    }
    return gs.playerBoards[0].expectedScore - gs.playerBoards[1].expectedScore
}
// row = line index
// column = rounds left
const v3weights = [
    [0,     9,      9.5,    9.9,    9.9],
    [0,     6,      7,      8,      8.5],
    [0,     3,      4,      5,      5.5],
    [0,     1.5,    2,      2.5,    3],
    [0,     0.8,    1,      1.5,    2]
]
function expectedScoreV3(gs: GameState, player: number) : number{
    
    // Active player board
    const pb = gs.playerBoards[player]
    // Create walls for each player
    const walls = gs.playerBoards.map(pb =>pb.wall.map(line => line.slice(0)))
    // Get scores
    const scores = walls.map((wall,playerind) => gs.moveToWall(playerind, wall))
    // How full each row of walls are
    const rowFill = walls.map(wall => wall.map(row => row.filter(x => x!=Tile.Null).length))
    // Check min rounds remaining after current round (for current state)
    const rounds = 5 - rowFill.reduce((a,b) => Math.max(a, ...b), 0)
    const wall = walls[player]
    let score = scores[player] + pb.score

    let exp_score = 0
    // row scores
    rowFill[player].forEach((len, n) => {
        // check if full row
        if (len == 5){
            score += 2
        } else if (rounds+len >= 5){
            exp_score += 2 * 0.1 * v3weights[n][rounds]
        }
    });

    // column scores
    const colweights = wall.reduce((weights, row, rowind) => {
        row.forEach((tile,colind) => {
            if (tile != Tile.Null){
                weights[colind] += 10
            } else {
                weights[colind] += v3weights[rowind][colind]
            }
        })
        return weights
    } ,[0,0,0,0,0])

    // sort to get full columns first, then best options
    colweights.sort( (a,b) => b-a)
    // number of non-full columns to consider
    let colkeep = rounds
    colweights.forEach(weight => {
        // Add column score for 5 weight
        if (weight == 50){
            score += 7
        } else if (colkeep){
            exp_score += 7 * weight/50
            colkeep --
        }
    })


    // colour scores
    // shuffle wall so colours are aligned in columns
    wall.forEach((row,ind) => {
        for (let i = ind; i; i--){
            row.push(row.shift() as Tile)
        }
    })
    // Then same operation as columns
    // colour scores
    const colourweights = wall.reduce((weights, row, rowind) => {
        row.forEach((tile,colind) => {
            if (tile != Tile.Null){
                weights[colind] += 10
            } else {
                weights[colind] += v3weights[rowind][colind]
            }
        })
        return weights
    } ,[0,0,0,0,0])

    // sort to get full columns first, then best options
    colourweights.sort( (a,b) => b-a)
    // number of non-full columns to consider
    let colourkeep = rounds
    colourweights.forEach(weight => {
        // Add column score for 5 weight
        if (weight == 50){
            score += 10
        } else if (colourkeep){
            exp_score += 10 * weight/50
            colourkeep --
        }
    })

    return score
}

export function evalValueV4(node:TreeNode): number {
    return expectedScoreV4(node.gamestate, 0) - expectedScoreV4(node.gamestate, 1) 
}

function expectedScoreV4(gs: GameState, player: number) : number{
    // Get the 
    const pb = gs.playerBoards[player]
    let wall = pb.wall.map(line => line.slice(0))
    let score =  gs.moveToWall(player, wall) + pb.score //+ gs.wallScore(wall)
    if (score < 0){
        score = 0
    }
    let exp_score = 0
    const weights = [
        [0.95,0.96,0.97,0.96,0.95],
        [0.96,0.97,0.98,0.97,0.96],
        [0.97,0.98,0.99,0.98,0.97],
        [0.96,0.97,0.98,0.97,0.96],
        [0.95,0.96,0.97,0.96,0.95],
    ]
    for (var row=0; row<5; row++){
        for (var col=0; col<5; col++){
            if (wall[row][col] != Tile.Null){
                exp_score += weights[row][col]
            }
        }
    }
    return score + exp_score
}

// Maximin (2+ players) score evaluation
export function evalScores(node:TreeNode): Array<number> {
    // create array of scores
    const gs = node.gamestate as GameState
    const scores: Array<number> = []
    for (var i=0; i<gs.nPlayers; i++){
        const expScore = gs.playerBoards[i].expectedScore;
        if (i == gs.previousPlayer){
            const score = gs.evalScore(i);
            scores.push(score)
            gs.playerBoards[i].expectedScore = score
        } else if (expScore != undefined){
            scores.push(expScore)
        } else {
            const score = gs.evalScore(i)
            scores.push(score)
            gs.playerBoards[i].expectedScore = score;
        }
        
    }
    return scores

}

// Maximin (2+ players) value evaluation from scores
export function evalValueMulti(node:TreeNode): number {
    const gs = node.gamestate as GameState
    const playerscore = node.score[gs.previousPlayer]
    let value  = Infinity
    for (var i=0; i<gs.nPlayers; i++){
        if (i != gs.previousPlayer){
            value = Math.min(value, playerscore - node.score[i])
        }
    }
    return value
}

// Convert generated moves into branches and return
export function moveGen(node:TreeNode): Array<TreeBranch>{
    // moves have already been generated in this gamestate
    // just create a list of branches with moves attached
    const branches: Array<TreeBranch> = []
    node.gamestate.availableMoves.forEach((move: Move) => {
        branches.push(new TreeBranch(move))
    });
    return branches
}


// Clone gamestate from node, create new node with gamestate
// mark new node if LEAF
export function movePlay(node:TreeNode, branch:TreeBranch): TreeNode{
    // clone the gamestate
    const gs = node.gamestate.clone() as GameState
    // get the move
    const move = branch.move
    // play the move
    gs.playMove(move)
    // check if end of turn
    var type = TreeNodeType.INNER
    if (!gs.nextTurn()){
        type = TreeNodeType.LEAF;
    }
    // create new node
    const child = new TreeNode(type, gs, node)
    child.aim = -node.aim
    return child
}

export function movePlaySmart (node:TreeNode, branch:TreeBranch): TreeNode {
    // get the move
    const move = branch.move
    // smart clone gamestate
    const gs = node.gamestate.smart_clone(move);
    // play the move
    gs.playMove(move)
    // check if end of turn
    var type = TreeNodeType.INNER
    if (!gs.nextTurn()){
        type = TreeNodeType.LEAF;
    }
    // create new node
    const child = new TreeNode(type, gs, node)
    child.aim = -node.aim
    return child
}

// Clone gamestate from node, create new node with gamestate
// mark new node if LEAF
export function movePlayQuick(node:TreeNode, branch:TreeBranch): TreeNode{
    // clone the gamestate
    const gs = node.gamestate.clone() as GameState
    // get the move
    const move = branch.move
    const player = gs.activePlayer
    // play the move
    gs.playMove(move)
    // check if end of turn
    var type = TreeNodeType.INNER
    if (!gs.nextTurn()){
        type = TreeNodeType.LEAF;
    }
    gs.playerBoards[player].expectedScore = gs.evalScore(player)
    // create new node
    const child = new TreeNode(type, gs, node)
    child.aim = -node.aim
    return child
}

// compares 2 moves to see if they are equal
// Needed becuase moves are generated in tree and compared
// with those from game for tree traversal
export function moveCompare(a:any, b:any): boolean {
    return (
        a.factory == b.factory &&
        a.line == b.line &&
        a.tile == b.tile &&
        a.player == b.player
    )
}




