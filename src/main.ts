import _ from 'lodash';

import Creeps, { CreepRole } from './creep';
import Builder from './role.builder';
import Harvester from './role.harvester';
import Upgrader from './role.upgrader';
import Repairer from './role.repairer';
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

    Harvester.spawn();
    Transporter.spawn();
    Upgrader.spawn();
    Builder.spawn();
    Repairer.spawn();
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
