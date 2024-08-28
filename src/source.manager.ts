import Creeps, { CreepRole } from './creep';
import { byLessTicksToLive } from './sort';
import { SpawnQueue } from './spawnQueue';
import { log } from './utils';

interface HarvesterMemory extends CreepMemory {
    workSpot: [number, number];
    sourceId: string;
    containerId: string;
}

interface HarvesterCreep extends Creep {
    memory: HarvesterMemory;
}

const Harvester = {
    setupMemory(creep: Creep) {
        // Check sourceId and workSpot and save to memory if not found
        if (!creep.memory.sourceId || !creep.memory.workSpot) {
            const otherHarvester = _.find(
                Game.creeps,
                otherHarvester =>
                    otherHarvester.room.name == creep.room.name &&
                    otherHarvester.memory.role == CreepRole.HARVESTER &&
                    otherHarvester.id != creep.id
            );
            const nonUsedSourceId = _.find(
                Object.keys(creep.room.memory.harvestSpots),
                sourceId => sourceId != otherHarvester?.memory.sourceId
            );

            if (nonUsedSourceId) {
                log(`Setting sourceId & workSpot for Harvester ${creep.name}`);
                creep.memory.sourceId = nonUsedSourceId;
                creep.memory.workSpot = creep.room.memory.harvestSpots[nonUsedSourceId];
            }
        }

        // Check containerId and save to memory if not found
        if (!creep.memory.containerId) {
            const containerCoords = creep.room.memory.containerSpots[creep.memory.sourceId];
            const containerPos: RoomPosition = new RoomPosition(
                containerCoords[0],
                containerCoords[1],
                creep.room.name
            );

            const positionStructures = containerPos.lookFor(LOOK_STRUCTURES);
            const container = _.find(positionStructures, structure => structure.structureType == STRUCTURE_CONTAINER);

            if (container) {
                log(`Setting containerId for Harvester ${creep.name}`);
                creep.memory.containerId = container.id;
            } else {
                log(
                    `Harvester ${creep.name} cannot find a close container at (${containerCoords[0]},${containerCoords[1]})`
                );
                return;
            }
        }
    },
    work(creep: HarvesterCreep) {
        this.setupMemory(creep);

        const [workSpotX, workSpotY] = creep.memory.workSpot;
        const creepInWorkSpot = creep.pos.x == workSpotX && creep.pos.y == workSpotY;

        if (creep.isFull) {
            const container = Game.getObjectById(creep.memory.containerId as Id<StructureContainer>);
            container && Creeps.transfer(creep).to(container);
        } else if (!creepInWorkSpot) {
            creep.moveTo(workSpotX, workSpotY, { visualizePathStyle: { stroke: '#ffaa00' } });
        } else {
            const source = Game.getObjectById(creep.memory.sourceId as Id<Source>);
            source && creep.harvest(source);
        }
    }
};

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
            // this.spawnHarvester();
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
        const harvester = {
            actions,
            name: `ExpansionHarvester${this.harvesters.length + 1}`,
            spawn: spawn.name,
            opts: {
                memory: {
                    role: CreepRole.HARVESTER,
                    ..._.first(dyingHarvester)?.memory
                }
            }
        };

        return Creeps.create(harvester);
    }
}
