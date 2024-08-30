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
        const containerCloseToController = this.room.controller?.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: s => s.structureType == STRUCTURE_CONTAINER
        });

        // table((containerCloseToController ?? []).reduce((acc,curr) => {
        //   return {
        //     ...acc,
        //     [`${curr.pos.x},${curr.pos.y}`]: true,
        //   }
        // }, {} as Record<string, unknown>), ['Container Position'], `Containers close to controller in room ${this.room.name}`);

        const containersDistanceToSpawn = this.room.containers
            .filter(container => {
                if (containerCloseToController?.length) {
                    return container.id != containerCloseToController[0].id;
                }

                return true;
            })
            .reduce(
                (acc, container) => {
                    return {
                        ...acc,
                        [`${container.pos.x},${container.pos.y}`]: PathFinder.search(this.room.spawn.pos, container.pos)
                            .cost
                    };
                },
                {} as Record<string, unknown>
            );

        // table(containersDistanceToSpawn, ['Container Position', 'Distance to spawn'], `Distance for container-spawn in room ${this.room.name}`);
        // this.#debugContainers();
        // this.#debugLinks();
    }
}
