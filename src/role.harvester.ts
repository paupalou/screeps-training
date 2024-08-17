import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

enum RoomEnergySources {
    NORTH = '5bbcae009099fc012e63846e',
    SOUTH = '5bbcae009099fc012e638470'
}

function harvest(creep: Creep) {
    const source = Game.getObjectById<Source>(creep.memory.sourceId);
    if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

function withdrawResources(creep: Creep) {
    const containers = creep.room.find<StructureContainer>(FIND_STRUCTURES, {
        filter: structure =>
            structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });
    const closest = creep.pos.findClosestByPath([
        ...Creeps.get(creep).spawn(),
        ...Creeps.get(creep).spawnExtensions(),
        ...containers
    ]);
    // const closest = creep.pos.findClosestByPath([...getSpawn(creep), ...getSpawnExtensions(creep)]);
    Creeps.transfer(creep).to(closest);
}

const Harvester: BaseCreep = {
    role: CreepRole.HARVESTER,
    spawn: function () {
        const harvesterCount = Creeps.count(CreepRole.HARVESTER);
        if (harvesterCount >= 4) {
            return;
        }
        const harvesterTypes = _.groupBy(Creeps.getByRole(CreepRole.HARVESTER), 'memory.sourceId');

        const harvester = {
            // actions: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            actions: [WORK, CARRY, CARRY, MOVE, MOVE],
            name: `Harvester${harvesterCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.HARVESTER,
                    sourceId:
                        (harvesterTypes[RoomEnergySources.SOUTH] ?? []).length >
                        (harvesterTypes[RoomEnergySources.NORTH] ?? []).length
                            ? RoomEnergySources.NORTH
                            : RoomEnergySources.SOUTH
                }
            }
        };
        Creeps.create(harvester);
    },
    run: function (creep) {
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
        }

        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
        }

        if (creep.memory.transfering) {
            withdrawResources(creep);
        } else {
            harvest(creep);
        }
    }
};

export default Harvester;
