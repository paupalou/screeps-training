import Harvester, { HarvesterCreep } from './creep.harvester';
import { CreepRole } from './creep';
import { SpawnQueue } from './spawnQueue';
import { byLessTicksToLive } from './sort';

export class SourceManager {
    room: Room;
    spawnQueue: SpawnQueue;

    constructor(room: Room, spawnQueue: SpawnQueue) {
        this.room = room;
        this.spawnQueue = spawnQueue;

        this.work();
    }

    work() {
        if (this.needSpawnHarvester) {
            this.spawnQueue.add(() => this.spawnHarvester());
        }

        _.forEach(this.harvesters, harvester => {
            Harvester.work(harvester);
        });
    }

    get harvesters() {
        return _.filter(
            Game.creeps,
            creep => creep.memory.role == CreepRole.HARVESTER && creep.room.name == this.room.name
        ) as HarvesterCreep[];
    }

    get needSpawnHarvester() {
        return (
            this.harvesters.filter(harvester => {
                if (harvester.spawning || harvester.ticksToLive == undefined) {
                    return true;
                }
                return harvester.ticksToLive >= 75;
            }).length < this.room.sources.length
        );
    }

    spawnHarvester() {
        const spawn = _.first(
            this.room.find(FIND_MY_STRUCTURES, {
                filter: structure => structure.structureType == STRUCTURE_SPAWN
            })
        );
        if (!spawn) {
            return;
        }

        const dyingHarvester = this.harvesters
            .filter(harvester => {
                if (harvester.spawning || harvester.ticksToLive == undefined) {
                    return false;
                }
                return harvester.ticksToLive < 75;
            })
            .sort(byLessTicksToLive);

        const actions = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
        return spawn.spawnCreep(actions, 'Harvester', {
            memory: {
                role: CreepRole.HARVESTER,
                ..._.first(dyingHarvester)?.memory
            },
        });
    }
}
