// Module for comparing the performance of players

import { PlayerInterface } from "../azul.js";
import { Game, GameResult } from "../game.js";

export class PerformanceResult {
    wins: Array<number> = [];
}

export class PlayerPerformance {
    constructor(public wins = 0, public losses = 0, public draws = 0, public played = 0) {}
}

// Class to compare the performance of 2 players by running through a number of games
export class PlayerCompare {
    results: Array<GameResult> = [];
    playerPerformance: Map<PlayerInterface, PlayerPerformance> = new Map();
    constructor(public players: Array<PlayerInterface>) {
        // Create Player result Map
        this.players.forEach((player) =>
            this.playerPerformance.set(player, new PlayerPerformance()),
        );
        // Set initial ids
        this.assign_ids();
    }

    compare(ngames: number): void {
        // Create a list of gamestates to be started by either player

        for (let i = 0; i < this.players.length; i++) {
            console.log("Playing %d games in round %d", ngames, i);
            for (let i = 0; i < ngames; i++) {
                const result = this.play_game();

                console.log(result.scores, result.winner?.id);
            }

            // swap players around
            this.swap_players();
        }

        const wins = [0, 0];
        this.results.forEach((result) => {
            if (result.winner != undefined) {
                wins[result.winner.id]++;
            }
        });
        console.log(wins);
    }

    compare_alternate(ngames = Infinity) {
        for (let played = 0; played < ngames; played++) {
            const game = new Game();
            console.log("Game seed", game.gamestate.seed);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            this.players.forEach((player, i) => {
                // Make a clone of gamestate for rng
                const newgame = new Game(game.gamestate.clone());
                // play out game with current  player orderings
                const result = this.play_game(newgame);
                this.swap_players();
                if (result.scores[0] > result.scores[1]) {
                    console.log(result.scores);
                } else {
                    console.log(result.scores, "*");
                }
            });
            this.playerPerformance.forEach((p) => console.log(p, (p.wins / p.losses).toFixed(2)));
        }
    }
    private play_game(game: Game = new Game()): GameResult {
        // add players to game

        this.players.forEach((player) => {
            game.addPlayer(player);
        });
        // play the game
        const result = game.play();
        this.results.push(result);
        this.apply_result(result);
        return result;
    }
    private assign_ids() {
        this.players.forEach((player, i) => (player.id = i));
    }
    private swap_players() {
        this.players.push(this.players.shift() as PlayerInterface);
        this.players.forEach((player, i) => (player.id = i));
    }
    private apply_result(result: GameResult) {
        for (const [player, performance] of this.playerPerformance) {
            performance.played++;
            if (result.winner == undefined) {
                performance.draws++;
            } else if (result.winner == player) {
                performance.wins++;
            } else {
                performance.losses++;
            }
        }
    }
}
