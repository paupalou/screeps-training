import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

// enum RoomEnergySources {
//     NORTH = '5bbcae009099fc012e63846e',
//     SOUTH = '5bbcae009099fc012e638470'
// }

function almostFullContainer(creep: Creep) {
    return creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
        filter: structure =>
            structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) < 500
    });
}

function withdrawResources(creep: Creep, target: StructureContainer | null) {
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
    const closest = creep.pos.findClosestByPath([...Creeps.get(creep).spawn(), ...Creeps.get(creep).spawnExtensions()]);

    Creeps.transfer(creep).to(closest);
}

const Transporter: BaseCreep = {
    role: CreepRole.TRANSPORTER,
    spawn: function () {
        const transporterCount = Creeps.count(CreepRole.TRANSPORTER);
        if (transporterCount >= 1) {
            return;
        }
        const harvester = {
            actions: [CARRY, CARRY, MOVE, MOVE],
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
        if (!creep.memory.transporting && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
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
