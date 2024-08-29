import { SpawnQueue } from './spawnQueue';
import { table } from './utils';

export class LogisticsManager {
    room: Room;
    spawnQueue: SpawnQueue;

    constructor(room: Room, spawnQueue: SpawnQueue) {
        this.room = room;
        this.spawnQueue = spawnQueue;

        this.work();
    }

    #debugContainers() {
        const containers = this.room.containers.reduce(
            (acc, container) => {
                return {
                    ...acc,
                    [`${container.pos.x},${container.pos.y}`]: container.store.energy
                };
            },
            {} as Record<string, unknown>
        );

        table(containers, ['Container Position', 'Container Energy'], `Containers for room ${this.room.name}`);
    }

    #debugLinks() {
        const links = this.room.links.reduce(
            (acc, link) => {
                return {
                    ...acc,
                    [`${link.pos.x},${link.pos.y}`]: link.store.energy
                };
            },
            {} as Record<string, unknown>
        );

        table(links, ['Link Position', 'Link Energy'], `Links for room ${this.room.name}`);
    }

    work() {
        // this.#debugContainers();
        // this.#debugLinks();
    }
}
