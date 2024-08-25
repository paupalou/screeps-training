import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

export const TRANSPORTERS = 2;

function getControllerContainer(room: Room) {
    const controller = room.controller?.pos;
    if (!controller) {
        return;
    }

    const containersInRange = controller.findInRange(FIND_STRUCTURES, 3, {
        filter: structure => structure.structureType == STRUCTURE_CONTAINER
    });

    if (containersInRange.length == 0) {
        return;
    }

    return containersInRange[0].id;
}

function byMostEnergy(containerA: StructureContainer, containerB: StructureContainer) {
    if (containerB.store.energy > containerA.store.energy) {
        return 1;
    } else if (containerA.store.energy > containerB.store.energy) {
        return -1;
    }
    return 0;
}

function almostFullContainer(creep: Creep) {
    // return creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
    //     filter: structure =>
    //         structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) < 1500
    // });
    //
    const containers = creep.room
        .find<StructureContainer>(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType == STRUCTURE_CONTAINER &&
                structure.store.energy >= creep.store.getFreeCapacity(RESOURCE_ENERGY)
        })
        .sort(byMostEnergy);

    return _.first(containers);
}

function withdrawResources(creep: Creep, target: StructureContainer | undefined) {
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
    const spawn = Creeps.get(creep).spawn();
    const extensions = Creeps.get(creep).spawnExtensions();

    const spawnEnergy = (spawn[0]?.store.energy ?? 0) + extensions.reduce((acc, curr) => acc + curr.store.energy, 0);
    const spawnEnergyCapactity =
        (spawn[0]?.store.getCapacity(RESOURCE_ENERGY) ?? 0) +
        extensions.reduce((acc, curr) => acc + curr.store.getCapacity(RESOURCE_ENERGY), 0);

    if (Math.floor((spawnEnergy / spawnEnergyCapactity) * 100) < 80) {
        const extensionsFilter: FilterOptions<FIND_STRUCTURES, StructureExtension> = {
            filter: (structure: AnyStructure) =>
                structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        };
        const closest = creep.pos.findClosestByPath([...spawn, ...Creeps.get(creep).spawnExtensions(extensionsFilter)]);
        Creeps.transfer(creep).to(closest);
        return;
    }

    // towers
    const towersFilter: FilterOptions<FIND_STRUCTURES, StructureExtension> = {
        filter: (structure: AnyStructure) =>
            structure.structureType == STRUCTURE_TOWER &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
            Math.floor((structure.store.energy / structure.store.getCapacity(RESOURCE_ENERGY)) * 100) < 80
    };
    const closestTower = creep.pos.findClosestByPath([...Creeps.get(creep).towers(towersFilter)]);
    if (closestTower) {
        Creeps.transfer(creep).to(closestTower);
        return;
    }

    // just in case spawn , extensions and tower are full transfer to controller container
    const controllerContainer = Game.getObjectById(getControllerContainer(creep.room) as Id<StructureContainer>);

    if (controllerContainer && creep.transfer(controllerContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(controllerContainer, { visualizePathStyle: { stroke: '#ffaa00' } });
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
