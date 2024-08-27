import Creeps, { CreepRole } from './creep';
import ExpansionHarvester, { Harvester } from './role.expansionHarvester';

export class SourceManager {
    static work(room: Room) {
        if (SourceManager.needSpawnHarvester(room)) {
            SourceManager.spawnHarvester(room);
        }

        _.forEach(SourceManager.harvesters(room), harvester => {
            ExpansionHarvester.work(harvester);
        });
    }

    static harvesters(room: Room) {
        return _.filter(
            Game.creeps,
            creep => creep.memory.role == CreepRole.EXPANSION_HARVESTER && creep.room.name == room.name
        ) as Harvester[];
    }

    static needSpawnHarvester(room: Room) {
        return (
            SourceManager.harvesters(room).filter(harvester => harvester.ticksToLive ?? 0 < 50).length <
            room.sources.length
        );
    }

    static spawnHarvester(room: Room) {
        const spawn = _.first(
            room.find(FIND_MY_STRUCTURES, {
                filter: structure => structure.structureType == STRUCTURE_SPAWN
            })
        );
        if (!spawn) {
            return;
        }

        const actions = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
        const expansionHarvester = {
            actions,
            name: `ExpansionHarvester${SourceManager.harvesters(room).length + 1}`,
            spawn: spawn.name,
            opts: {
                memory: {
                    role: CreepRole.EXPANSION_HARVESTER
                }
            }
        };
        if (!spawn.spawning) {
            Creeps.create(expansionHarvester);
        }
    }
}
