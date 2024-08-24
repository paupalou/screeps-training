import _ from 'lodash';

import Creeps, { type BaseCreep, CreepRole } from './creep';

export const EXPANSION_ENERGY_BALANCERS = 2;

function getDistance(from: Structure, to: Structure) {
    return from.pos.getRangeTo(to.pos);
}

function getUnusedSourceContainer(room: Room) {
    const otherEnergyBalancer = _.find(
        Game.creeps,
        balancer => balancer.memory.role == CreepRole.EXPANSION_ENERGY_BALANCER
    );

    const sourceContainers = _.map(room.memory.sources, sourceId => {
        const source = Game.getObjectById(sourceId as Id<Source>);
        if (!source) {
            return;
        }

        const container = source.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: s => s.structureType == STRUCTURE_CONTAINER
        });

        return container[0]?.id;
    });

    const nonUsedContainerId = _.find(
        sourceContainers,
        containerId => containerId != otherEnergyBalancer?.memory.containerId
    );

    return nonUsedContainerId;
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

function transfer(creep: Creep) {
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

    const container = Game.getObjectById(creep.memory.targetId as Id<StructureContainer>);
    if (container && creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

const ExpansionEnergyBalancer: BaseCreep = {
    role: CreepRole.EXPANSION_ENERGY_BALANCER,
    spawn: function () {
        const room = Game.rooms['E18S27'];
        const expansionEnergyBalancerCount = Creeps.count(CreepRole.EXPANSION_ENERGY_BALANCER);
        if (expansionEnergyBalancerCount >= EXPANSION_ENERGY_BALANCERS) {
            return;
        }

        const containerId = getUnusedSourceContainer(room);
        const targetId = getControllerContainer(room);

        const from = Game.getObjectById(containerId as Id<StructureContainer>);
        const to = Game.getObjectById(targetId as Id<StructureContainer>);

        let distanceOfContainers = 5;

        if (from && to) {
            distanceOfContainers = getDistance(from, to);

            if (distanceOfContainers % 2 != 0) {
                distanceOfContainers = distanceOfContainers - 1;
            }

            distanceOfContainers = distanceOfContainers / 2;
        }

        const expansionEnergyBalancer = {
            actions: [...Array(distanceOfContainers).fill(CARRY), ...Array(distanceOfContainers / 2).fill(MOVE)],
            name: `ExpansionEnergyBalancer${expansionEnergyBalancerCount + 1}`,
            spawn: 'Spawn2',
            opts: {
                memory: {
                    role: CreepRole.EXPANSION_ENERGY_BALANCER,
                    containerId: getUnusedSourceContainer(room),
                    targetId: getControllerContainer(room)
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
            const container = Game.getObjectById(creep.memory.containerId as Id<StructureContainer>);
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
