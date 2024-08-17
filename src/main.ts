import _ from 'lodash';

import Creeps, { CreepRole } from './creep';
import Builder from './role.builder';
import Harvester from './role.harvester';
import Upgrader from './role.upgrader';
import Repairer from './role.repairer';
import { log } from './utils';
import Transporter from './role.transporter';

function respawnCreeps() {
    const creeps: Record<string, Creep[]> = {
        harvester: [],
        builder: [],
        upgrader: [],
        repairer: []
    };

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        creeps[creep.memory.role] && creeps[creep.memory.role].push(creep);
    }

    const builderCount = creeps.builder.length;
    const upgraderCount = creeps.upgrader.length;
    const repairerCount = creeps.repairer.length;

    Harvester.spawn && Harvester.spawn();
    Transporter.spawn && Transporter.spawn();

    if (builderCount < 2) {
        const nextBuilderNumber = builderCount + 1;
        const builder = {
            actions: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            name: `Builder${nextBuilderNumber}`,
            spawn: 'Spawn1',
            opts: {
                memory: {
                    role: CreepRole.BUILDER,
                    structureType: STRUCTURE_ROAD
                }
            }
        };
        createCreep(builder);
    }
    // } else if (builderCount < 1) {
    //     const builder = {
    //         actions: [WORK, CARRY, MOVE],
    //         name: 'Builder1',
    //         spawn: 'Spawn1',
    //         opts: {
    //             memory: { role: CreepRole.BUILDER }
    //         }
    //     };
    //     createCreep(builder);
    // }

    if (upgraderCount < 2) {
        const nextUpgraderNumber = upgraderCount + 1;
        const upgrader = {
            actions: [WORK, WORK, WORK, WORK, CARRY, MOVE],
            name: `Upgrader${nextUpgraderNumber}`,
            spawn: 'Spawn1',
            opts: {
                memory: { role: CreepRole.UPGRADER }
            }
        };
        createCreep(upgrader);
    }

    if (repairerCount < 2) {
        const nextRepairerNumber = repairerCount + 1;
        const upgrader = {
            actions: [WORK, CARRY, MOVE],
            name: `Repairer${nextRepairerNumber}`,
            spawn: 'Spawn1',
            opts: {
                memory: { role: CreepRole.REPAIRER }
            }
        };
        createCreep(upgrader);
    }
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

function cleanUp() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

export function loop(): void {
    cleanUp();
    respawnCreeps();

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role === CreepRole.HARVESTER) {
            Harvester.run(creep);
            continue;
        }

        if (Creeps.count(CreepRole.UPGRADER) > 0 && creep.memory.role === CreepRole.BUILDER) {
            Builder.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.UPGRADER) {
            Upgrader.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.REPAIRER) {
            Repairer.run(creep);
            continue;
        }

        if (creep.memory.role === CreepRole.TRANSPORTER) {
            Transporter.run(creep);
            continue;
        }
    }
}
