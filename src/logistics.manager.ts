import { SpawnQueue } from './spawnQueue';
import { log } from './utils';

export class LogisticsManager {
    room: Room;
    spawnQueue: SpawnQueue;

    constructor(room: Room, spawnQueue: SpawnQueue) {
        this.room = room;
        this.spawnQueue = spawnQueue;

        this.work();
    }

    work() {
        // log(
        //     `[LogisticsManager] energy capacity for room  ${this.room.name} = ${this.room.energyCapacityAvailable}`
        // );
    }
}
