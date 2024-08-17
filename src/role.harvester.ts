import _ from 'lodash';

import { BaseCreep, CreepRole } from './creep';

function harvest(creep: Creep) {
    const source = Game.getObjectById<Source>(creep.memory.sourceId);
    if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

function getSpawn(creep: Creep) {
    return creep.room.find<StructureSpawn>(FIND_STRUCTURES, {
        filter: structure =>
            structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });
}

function getSpawnExtensions(creep: Creep) {
    return creep.room.find<StructureExtension>(FIND_STRUCTURES, {
        filter: structure =>
            structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });
}

function transferTo(creep: Creep, target: StructureContainer | StructureSpawn | StructureExtension | null) {
    if (!target) {
        return;
    }

    const amount =
        target.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.energy
            ? creep.store.energy
            : target.store.getFreeCapacity(RESOURCE_ENERGY);
    const result = creep.transfer(target, RESOURCE_ENERGY, amount);
    if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    }
    return result;
}

function withdrawResources(creep: Creep) {
    const containers = creep.room.find<StructureContainer>(FIND_STRUCTURES, {
        filter: structure =>
            structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });
    const closest = creep.pos.findClosestByPath([...getSpawn(creep), ...getSpawnExtensions(creep), ...containers]);
    transferTo(creep, closest);
}

const Harvester: BaseCreep = {
    role: CreepRole.HARVESTER,
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
