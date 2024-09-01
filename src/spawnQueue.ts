import { log } from './utils';

export class SpawnQueue {
    queue: Function[];

    constructor() {
        this.queue = [];
    }

    run() {
        if (this.queue.length == 0) {
            log(`queue is empty`);
            return;
        }

        const queuedFunction = this.queue[0];
        const result = queuedFunction();

        if (result != OK) {
            log(`[SpawnQueue] Spawn error ${result}`);
            log(this.queue);
            return;
        }

        log(`[SpawnQueue] Spawn success`);
        this.queue.shift();
    }

    add(fn: Function) {
        log(`[SpawnQueue] Added item to queue`);
        this.queue.push(fn);

        this.run();
    }
}
