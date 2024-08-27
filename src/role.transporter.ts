import _ from 'lodash';

import Creeps, { CreepRole, type BaseCreep } from './creep';
import { byLessEnergy, byMostEnergy } from './sort';

export const TRANSPORTERS = 2;

function otherRoomTransporters(creep: Creep) {
    return _.filter(
        Game.creeps,
        otherCreep =>
            otherCreep.id != creep.id &&
            otherCreep.room.name == creep.room.name &&
            otherCreep.memory.role == CreepRole.TRANSPORTER
    );
}

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

function withdrawResources(creep: Creep, target: StructureContainer | StructureStorage | undefined) {
    const droppedResources = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
    if (droppedResources) {
        if (creep.pickup(droppedResources) == ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedResources, { visualizePathStyle: { stroke: '#ffffff' } });
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
    const otherTransporters = otherRoomTransporters(creep);
    const controllerContainer = Game.getObjectById(getControllerContainer(creep.room) as Id<StructureContainer>);

    if (
        controllerContainer &&
        controllerContainer?.store.energy < 1500 &&
        otherRoomTransporters.length &&
        (otherTransporters[0].ticksToLive ?? 0) > (creep.ticksToLive ?? 0)
    ) {
        if (controllerContainer && creep.transfer(controllerContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controllerContainer, { visualizePathStyle: { stroke: '#ffaa00' } });
        }

        return;
    }

    // check if creep has some resource that is not energy
    _.filter(Object.keys(creep.store) as ResourceConstant[], resource => resource != RESOURCE_ENERGY).forEach(
        nonEnergyResource => {
            if (creep.room.storage) {
                Creeps.transfer(creep, nonEnergyResource).to(creep.room.storage);
            } else {
                Creeps.transfer(creep).to(creep.closestContainer);
            }
            return;
        }
    );

    const spawn = Creeps.get(creep).spawn();
    const extensions = Creeps.get(creep).spawnExtensions();

    const spawnEnergy = (spawn[0]?.store.energy ?? 0) + extensions.reduce((acc, curr) => acc + curr.store.energy, 0);
    const spawnEnergyCapactity =
        (spawn[0]?.store.getCapacity(RESOURCE_ENERGY) ?? 0) +
        extensions.reduce((acc, curr) => acc + curr.store.getCapacity(RESOURCE_ENERGY), 0);
    const extensionsFilter: FilterOptions<FIND_STRUCTURES, StructureExtension> = {
        filter: (structure: AnyStructure) =>
            structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    };
    const closestExtensionOrSpawn = creep.pos.findClosestByPath([
        ...spawn,
        ...Creeps.get(creep).spawnExtensions(extensionsFilter)
    ]);

    if (Math.floor((spawnEnergy / spawnEnergyCapactity) * 100) < 60) {
        Creeps.transfer(creep).to(closestExtensionOrSpawn);
        return;
    }

    // towers
    const towers = creep.room
        .find<StructureTower>(FIND_STRUCTURES, {
            filter: (structure: AnyStructure) =>
                structure.structureType == STRUCTURE_TOWER &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                Math.floor((structure.store.energy / structure.store.getCapacity(RESOURCE_ENERGY)) * 100) < 80
        })
        .sort(byLessEnergy);

    if (towers.length) {
        Creeps.transfer(creep).to(towers[0]);
        return;
    }

    if (creep.room.storage) {
        Creeps.transfer(creep).to(creep.room.storage);
    } else {
        // fill extension or spawn if towers are almost full
        Creeps.transfer(creep).to(closestExtensionOrSpawn);
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
            const controllerContainer = Game.getObjectById(
                getControllerContainer(creep.room) as Id<StructureContainer>
            );

            const otherTransporters = otherRoomTransporters(creep);

            if (
                controllerContainer &&
                controllerContainer?.store.energy < 1500 &&
                otherRoomTransporters.length &&
                (otherTransporters[0].ticksToLive ?? 0) > (creep.ticksToLive ?? 0)
            ) {
                withdrawResources(creep, creep.room.storage);
            } else {
                const topContainer = Game.getObjectById('66cb141f9d107301af33c924' as Id<StructureContainer>);
                topContainer && withdrawResources(creep, topContainer);
            }
        }
    }
};

export default Transporter;
