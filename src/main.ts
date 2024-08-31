import Creeps, { CreepRole } from './creep';
import Towers from './structure.tower';
import Builder from './role.builder';
import Upgrader from './role.upgrader';
import Repairer from './role.repairer';
import Transporter, { TRANSPORTERS } from './role.transporter';
import Stealer from './role.stealer';
import Claimer from './role.claimer';
import Invader from './role.invader';
import { RoomManager } from './room.manager';
import ExpansionBuilder from './role.expansionBuilder';
import ExpansionEnergyBalancer from './role.expansionEnergyBalancer';
import ExpansionRepairer from './role.expansionRepairer';
import ExpansionUpgrader from './role.expansionUpgrader';
import Profiler from './profiler';
import './prototypes';

// import { hello } from './creeps/hola';
// hello()

const PROFILE = true;

function respawnCreeps() {
    Transporter.spawn();
    if (Creeps.count(CreepRole.TRANSPORTER) < TRANSPORTERS) {
        // do not create any other creep if we dont have expected transporter alive
        return;
    }

    Upgrader.spawn();
    Builder.spawn();
    Repairer.spawn();
    Stealer.spawn();
    Claimer.spawn();
    Invader.spawn();

    // Expansion
    ExpansionEnergyBalancer.spawn();
    // TODO Implement some kind of spawnQueue
    if (Creeps.count(CreepRole.HARVESTER, 'E18S27') < 2) {
        return;
    }
    if (Creeps.count(CreepRole.EXPANSION_ENERGY_BALANCER, 'E18S27') < 2) {
        return;
    }

    ExpansionUpgrader.spawn();
    ExpansionBuilder.spawn();
    ExpansionRepairer.spawn();
}

function cleanUp() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

PROFILE && Profiler.enable();

export function loop(): void {
    Profiler.wrap(function () {
        cleanUp();
        RoomManager.start();
        respawnCreeps();

        Towers.run(Game.rooms['E18S28']);
        Towers.run(Game.rooms['E18S27']);

        for (const name in Game.creeps) {
            const creep = Game.creeps[name];

            if (creep.memory.role === CreepRole.BUILDER) {
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

            if (creep.memory.role === CreepRole.STEALER) {
                Stealer.run(creep);
                continue;
            }

            if (creep.memory.role === CreepRole.CLAIMER) {
                Claimer.run(creep);
                continue;
            }

            if (creep.memory.role === CreepRole.INVADER) {
                Invader.run(creep);
                continue;
            }

            if (creep.memory.role === CreepRole.EXPANSION_BUILDER) {
                ExpansionBuilder.run(creep);
                continue;
            }

            if (creep.memory.role === CreepRole.EXPANSION_ENERGY_BALANCER) {
                ExpansionEnergyBalancer.run(creep);
                continue;
            }

            if (creep.memory.role === CreepRole.EXPANSION_REPAIRER) {
                ExpansionRepairer.run(creep);
                continue;
            }

            if (creep.memory.role === CreepRole.EXPANSION_UPGRADER) {
                ExpansionUpgrader.run(creep);
                continue;
            }
        }
    });
}
