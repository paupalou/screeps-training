import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';
import { log } from './utils';

export const EXPANSION_ENERGY_BALANCERS = 4;

function transfer(creep: Creep) {
    const spawn = Creeps.get(creep).spawn();
    const extensions = Creeps.get(creep).spawnExtensions();

    const spawnEnergy = (spawn[0]?.store.energy ?? 0) + extensions.reduce((acc, curr) => acc + curr.store.energy, 0);
    const spawnEnergyCapactity =
        (spawn[0]?.store.getCapacity(RESOURCE_ENERGY) ?? 0) +
        extensions.reduce((acc, curr) => acc + curr.store.getCapacity(RESOURCE_ENERGY), 0);

    // log(`spawnEnergy ${spawnEnergy}`)
    // log(`spawnEnergyCapactity ${spawnEnergyCapactity}`)
    if (Math.floor(spawnEnergy / spawnEnergyCapactity) * 100 < 80) {
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
            Math.floor(structure.store.energy / structure.store.getFreeCapacity(RESOURCE_ENERGY)) * 100 < 80
    };
    const closestTower = creep.pos.findClosestByPath([...Creeps.get(creep).towers(towersFilter)]);

    if (closestTower) {
        Creeps.transfer(creep).to(closestTower);
        return;
    }

    // check if target is stored in mem
    if (creep.memory.targetId) {
        const container = Game.getObjectById(creep.memory.targetId as Id<StructureContainer>);
        if (container && creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
        }

        return;
    }

    const controller = creep.room.controller?.pos;
    if (!controller) {
        return;
    }

    const containersInRange = controller.findInRange(FIND_STRUCTURES, 3, {
        filter: structure => structure.structureType == STRUCTURE_CONTAINER
    });

    if (containersInRange.length == 0) {
        return;
    }

    creep.memory.targetId = containersInRange[0].id;
}

const ExpansionEnergyBalancer: BaseCreep = {
    role: CreepRole.EXPANSION_ENERGY_BALANCER,
    spawn: function () {
        const expansionEnergyBalancerCount = Creeps.count(CreepRole.EXPANSION_ENERGY_BALANCER);
        if (expansionEnergyBalancerCount >= EXPANSION_ENERGY_BALANCERS) {
            return;
        }

        const expansionEnergyBalancer = {
            actions: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
            name: `ExpansionEnergyBalancer${expansionEnergyBalancerCount + 1}`,
            spawn: 'Spawn2',
            opts: {
                memory: {
                    role: CreepRole.EXPANSION_ENERGY_BALANCER
                }
            }
        };
        Creeps.create(expansionEnergyBalancer);
    },
    run: function (creep) {
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
        }
        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
        }

        if (creep.store.energy === 0 || (!creep.memory.transfering && creep.store.getFreeCapacity() > 0)) {
            const containers = creep.room
                .find<StructureContainer>(FIND_STRUCTURES, {
                    filter: structure =>
                        structure.structureType == STRUCTURE_CONTAINER &&
                        structure.id != creep.memory.targetId &&
                        structure.store.energy >= creep.store.getFreeCapacity(RESOURCE_ENERGY)
                })
                .sort((sA, sB) => {
                    if (sB.store.energy > sA.store.energy) {
                        return 1;
                    } else if (sA.store.energy > sB.store.energy) {
                        return -1;
                    }
                    return 0;
                });

            const container = _.first(containers);

            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        } else {
            creep.memory.transfering = true;
            transfer(creep);
        }
    }
};

export default ExpansionEnergyBalancer;
