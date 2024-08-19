import _ from 'lodash';

import { log } from './utils';

export enum CreepRole {
    HARVESTER = 'harvester',
    BUILDER = 'builder',
    UPGRADER = 'upgrader',
    REPAIRER = 'repairer',
    TRANSPORTER = 'transporter',
    STEALER = 'stealer'
}

export interface BaseCreep {
    role: CreepRole;
    spawn: VoidFunction;
    run: (creep: Creep) => void;
}

function getByRole(role: CreepRole) {
    return _.filter(Game.creeps, creep => creep.memory.role === role);
}

function count(role: CreepRole) {
    return getByRole(role).length;
}

function transfer(creep: Creep) {
    function to(target: StructureContainer | StructureSpawn | StructureExtension | StructureTower | null) {
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

    return { to };
}

function get(creep: Creep) {
    function structure<T>(filterOptions?: FilterOptions<FIND_STRUCTURES>) {
        return creep.room.find(FIND_STRUCTURES, filterOptions) as T;
    }
    function constructionSites(filterOptions?: FilterOptions<FIND_CONSTRUCTION_SITES>) {
        return creep.room.find(FIND_CONSTRUCTION_SITES, filterOptions);
    }
    function spawn() {
        return creep.room.find<StructureSpawn>(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
    }

    function spawnExtensions(
        filterOptions: FilterOptions<FIND_STRUCTURES, StructureExtension> | undefined = {
            filter: structure => structure.structureType == STRUCTURE_EXTENSION
        }
    ) {
        return creep.room.find<StructureExtension>(FIND_STRUCTURES, filterOptions);
    }

    function towers(
        filterOptions: FilterOptions<FIND_STRUCTURES, StructureTower> | undefined = {
            filter: structure => structure.structureType == STRUCTURE_TOWER
        }
    ) {
        return creep.room.find(FIND_STRUCTURES, filterOptions);
    }

    return {
        constructionSites,
        towers,
        spawn,
        spawnExtensions,
        structure
    };
}

function createCreep(
    creep = {
        actions: [WORK, CARRY, MOVE],
        name: 'Harvester1',
        spawn: 'Spawn1',
        opts: { memory: { role: CreepRole.HARVESTER } }
    }
) {
    const result = Game.spawns[creep.spawn].spawnCreep(creep.actions, creep.name, creep.opts);
    if (result === ERR_NOT_ENOUGH_ENERGY) {
        log(`Not enough energy to create ${creep.name}`);
    } else if (result === ERR_NAME_EXISTS) {
        const duplicatedCreepNumber = Number(creep.name.slice(-1));
        const nextCreepName = creep.name.slice(0, -1) + String(duplicatedCreepNumber + 1);
        log(`Creep named ${creep.name} already exists, trying with ${nextCreepName}`);
        const nextCreep = { ...creep, name: nextCreepName };
        createCreep(nextCreep);
    }
}

export default {
    get,
    count,
    getByRole,
    transfer,
    create: createCreep
};
