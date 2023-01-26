import { add, complete, cycle, suite } from "benny";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const factories: number[][] = new Array(6).fill(new Array(4).fill(Math.random()));
// let count =

void suite(
    "Factory Clone",

    add("map", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const line_ind = Math.floor(Math.random() * 6);
        factories.map((line) => line.slice(0));
    }),
    add("map conditional", () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const line_ind = Math.floor(Math.random() * 6);
        factories.map((line, ind) => {
            if (ind == line_ind) {
                return line.slice(0);
            } else {
                return line;
            }
        });
    }),
    add("for each push", () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const line_ind = Math.floor(Math.random() * 6);
        const new_factories = [];
        factories.forEach((line, ind) => {
            if (ind == line_ind) {
                new_factories.push(line.slice(0));
            } else {
                new_factories.push(line);
            }
        });
    }),
    add("for each preallocate", () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const line_ind = Math.floor(Math.random() * 6);
        const new_factories = new Array(factories.length);
        factories.forEach((line, ind) => {
            if (ind == line_ind) {
                new_factories[ind] = line.slice(0);
            } else {
                new_factories[ind] = line;
            }
        });
    }),

    add("for push", () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const line_ind = Math.floor(Math.random() * 6);
        const new_factories = [];
        for (let ind = 0; ind < factories.length; ind++) {
            if (ind == line_ind) {
                new_factories.push(factories[ind].slice(0));
            } else {
                new_factories.push(factories[ind]);
            }
        }
    }),
    add("for preallocate", () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const line_ind = Math.floor(Math.random() * 6);
        const new_factories = new Array(factories.length);
        for (let ind = 0; ind < factories.length; ind++) {
            if (ind == line_ind) {
                new_factories[ind] = factories[ind].slice(0);
            } else {
                new_factories[ind] = factories[ind];
            }
        }
    }),

    add("for preallocate local length", () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const line_ind = Math.floor(Math.random() * 6);
        const length = factories.length;
        const new_factories = new Array(length);
        for (let ind = 0; ind < length; ind++) {
            if (ind == line_ind) {
                new_factories[ind] = factories[ind].slice(0);
            } else {
                new_factories[ind] = factories[ind];
            }
        }
    }),

    cycle(),

    complete(),

    // save({
    //     file: "negamax_unify_" + depth.toString() + "_depth",
    //     folder: "benchmarks/results",
    // }),
);
