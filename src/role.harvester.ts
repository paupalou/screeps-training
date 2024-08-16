import _ from 'lodash';

import { BaseCreep, CreepRole } from './creep';

function isFull(creep: Creep) {
    return creep.store.getFreeCapacity() === 0;
}

function harvest(creep: Creep) {
    const source = Game.getObjectById<Source>(creep.memory.sourceId);
    if (source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

function getSpawn(creep: Creep) {
    return creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType == STRUCTURE_SPAWN
    })[0];
}

function getSpawnExtensions(creep: Creep) {
    return creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
            structure.structureType == STRUCTURE_EXTENSION &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.energy
    });
}

function transferTo(creep: Creep, target: Structure | null) {
    if (!target) {
        return;
    }

    const result = creep.transfer(target, RESOURCE_ENERGY);
    if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    }
    return result;
}

function withdrawResources(creep: Creep) {
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
            structure.structureType == STRUCTURE_CONTAINER &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.energy
    });
    const closest = creep.pos.findClosestByPath([getSpawn(creep), ...getSpawnExtensions(creep), ...containers]);
    transferTo(creep, closest);
}

const Harvester: BaseCreep = {
    role: CreepRole.HARVESTER,
    run: function (creep) {
        if (isFull(creep)) {
            withdrawResources(creep);
            return;
        }
        harvest(creep);
    }
};

export default Harvester;
