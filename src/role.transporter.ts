import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

export const TRANSPORTERS = 1;

function almostFullContainer(creep: Creep) {
    return creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
        filter: structure =>
            structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) < 1500
    });
}

function withdrawResources(creep: Creep, target: StructureContainer | null) {
    const droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
    if (droppedEnergy) {
        if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedEnergy, { visualizePathStyle: { stroke: '#ffffff' } });
        }
        return;
    }

    if (!target) {
        return;
    }

    const result = creep.withdraw(target, RESOURCE_ENERGY);
    if (result == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    }
    return result;
}

function storeResources(creep: Creep) {
    const extensionsFilter: FilterOptions<FIND_STRUCTURES, StructureExtension> = {
        filter: (structure: AnyStructure) =>
            structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    };

    const closestNonTower = creep.pos.findClosestByPath([
        ...Creeps.get(creep).spawn(),
        ...Creeps.get(creep).spawnExtensions(extensionsFilter)
    ]);

    if (closestNonTower) {
        Creeps.transfer(creep).to(closestNonTower);
    } else {
        const towersFilter: FilterOptions<FIND_STRUCTURES, StructureExtension> = {
            filter: (structure: AnyStructure) =>
                structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        };
        const closestTower = creep.pos.findClosestByPath([...Creeps.get(creep).towers(towersFilter)]);

        closestTower && Creeps.transfer(creep).to(closestTower);
    }
}

const Transporter: BaseCreep = {
    role: CreepRole.TRANSPORTER,
    spawn: function () {
        const transporterCount = Creeps.count(CreepRole.TRANSPORTER);
        if (transporterCount >= TRANSPORTERS) {
            return;
        }
        const harvester = {
            actions: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
            name: `Transporter${transporterCount + 1}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.TRANSPORTER
                }
            }
        };
        Creeps.create(harvester);
    },
    run: function (creep) {
        if (!creep.memory.transporting && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.transporting = true;
        }

        if (creep.memory.transporting && creep.store.energy == 0) {
            creep.memory.transporting = false;
        }

        if (creep.memory.transporting) {
            storeResources(creep);
        } else {
            withdrawResources(creep, almostFullContainer(creep));
        }
    }
};

export default Transporter;
