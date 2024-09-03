import { CreepRole } from './creep';
import { SpawnQueue } from './spawnQueue';
import { log, table } from './utils';

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

    get needSpawnTransporter() {
        const transportersInRoom = this.room.creepsByRole(CreepRole.TRANSPORTER);
        log(`There are ${transportersInRoom.length} transporters in room ${this.room.name}`);

        return false;
    }

    work() {
        // const energyFrom = this.room.controllerEnergyFrom;

        // log(energyFrom ?? 'no energy from')
        // if (energyFrom) {
        //     const containerSpots = Object.values(this.room.memory.containerSpots);
        //     const hasAssignedContainer = _.some(
        //         containerSpots,
        //         ([containerX, containerY]) => energyFrom.pos.x == containerX && energyFrom.pos.y == containerY
        //     );
        //     if (hasAssignedContainer) {
        //         log(`Strucutre (${energyFrom.pos.x},${energyFrom.pos.y}) is already filled by a source`);
        //     }
        // }

        if (this.needSpawnTransporter) {
          console.log('woot')
            // this.spawnQueue.add(() => this.spawnHarvester());
        }

        // table(containersDistanceToSpawn, ['Container Position', 'Distance to spawn'], `Distance for container-spawn in room ${this.room.name}`);
        // this.#debugContainers();
        // this.#debugLinks();
    }
}
