import Harvester, { HarvesterCreep } from './creep.harvester';
import { CreepRole } from './creep';
import { SpawnQueue } from './spawnQueue';
import { byLessTicksToLive } from './sort';
import { log } from './utils';

const DYING_BREAKPOINT = 75;

export class SourceManager {
    room: Room;
    spawnQueue: SpawnQueue;

    constructor(room: Room, spawnQueue: SpawnQueue) {
        this.room = room;
        this.spawnQueue = spawnQueue;

        this.work();

        const data = this.harvesters.reduce(
            (acc, curr) => {
                return {
                    ...acc,
                    [curr.memory.sourceId]: (acc[curr.memory.sourceId] ?? 0) + 1
                };
            },
            {} as Record<string, number>
        );
        // log(`Source data for room ${room.name}`);
        // log(data);
    }

    work() {
        if (this.needSpawnHarvester) {
            this.spawnQueue.add(() => this.spawnHarvester());
        }

        _.forEach(this.harvesters, harvester => {
            Harvester.work(harvester);
        });

        // log(
        //     `Sources in room ${this.room.name} needs ${this.harvestersPerSource} harvesters with body [${_.map(this.nextHarvesterBodyParts, (part: string) => part.toUpperCase())}]`
        // );
        if (this.room.name == 'E18S28') {
            const ticksNeededToSpawn = this.nextHarvesterBodyParts.length * 3;
            const source = Game.getObjectById('5bbcae009099fc012e638470' as Id<Source>);
            if (source) {
                const costToSource = PathFinder.search(this.room.spawn.pos, { pos: source.pos, range: 1 });
                log(`total ticks needed ${ticksNeededToSpawn + costToSource.cost}`);
            }
        }
    }

    get needSpawnHarvester() {
        const harvestersInRoom = this.harvesters.filter(harvester => {
            if (harvester.spawning || harvester.ticksToLive == undefined) {
                return true;
            }
            // do not count harvesters close to die so we can avoid time on replace
            return harvester.ticksToLive >= DYING_BREAKPOINT;
        });

        return this.room.sources.length * this.harvestersPerSource > harvestersInRoom.length;
    }

    spawnHarvester() {
        const consumedCreepIds = this.harvesters.map(c => c.memory.replaceCreep);
        const creepsCloseToDie = this.dyingHarvesters.filter(
            dyingHarvester => !consumedCreepIds.includes(dyingHarvester.id)
        );

        let memory: CreepMemory = { role: CreepRole.HARVESTER };

        const someCreepCloseToDie = _.first(creepsCloseToDie);

        if (someCreepCloseToDie) {
            memory = {
                ...memory,
                ...someCreepCloseToDie.memory,
                replaceCreep: someCreepCloseToDie.id
            };
        }

        return this.room.spawn.spawnCreep(this.nextHarvesterBodyParts, 'Harvester', {
            memory
        });
    }

    get harvesters() {
        return _.filter(
            Game.creeps,
            creep => creep.memory.role == CreepRole.HARVESTER && creep.room.name == this.room.name
        ) as HarvesterCreep[];
    }

    get harvestersPerSource() {
        if (this.room.energyCapacityAvailable >= 1000) {
            // One per source
            return 1; // [...Array(5).fill(WORK), CARRY, MOVE]];
        } else if (this.room.energyCapacityAvailable >= 600) {
            // Two per source
            return 2; // [...Array(3).fill(WORK), CARRY, MOVE]];
        } else {
            // Three per souce
            return 3; // [WORK, CARRY, MOVE]];
        }
    }

    get nextHarvesterBodyParts() {
        if (this.harvestersPerSource == 3) {
            return [WORK, CARRY, MOVE];
        } else if (this.harvestersPerSource == 2) {
            return [...Array(3).fill(WORK), CARRY, MOVE];
        } else if (this.harvestersPerSource == 1) {
            return [...Array(5).fill(WORK), CARRY, MOVE];
        }

        return [];
    }

    get dyingHarvesters() {
        return this.harvesters
            .filter(harvester => {
                if (harvester.spawning || harvester.ticksToLive == undefined) {
                    return false;
                }
                return harvester.ticksToLive < DYING_BREAKPOINT;
            })
            .sort(byLessTicksToLive);
    }

    // get miningPositionsFor() {
    // }
}
