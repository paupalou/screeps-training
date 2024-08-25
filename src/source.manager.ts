import Creeps, { CreepRole } from './creep';
import ExpansionHarvester from './role.expansionHarvester';

export class SourceManager {
    #room: Room;
    harvesters: ExpansionHarvester[];

    constructor(room: Room) {
        this.#room = room;

        this.harvesters = _.filter(
            Game.creeps,
            creep => creep.memory.role == CreepRole.EXPANSION_HARVESTER && creep.room.name == this.#room.name
        ).map(creep => new ExpansionHarvester(creep.id));

        this.run();
    }

    get sources() {
        const storedSources: string[] | undefined = this.#room.memory.sources;
        if (storedSources) {
            return _.map(storedSources, sourceId => Game.getObjectById<Source>(sourceId as Id<Source>));
        }

        const roomSources = _.map(this.#room.find(FIND_SOURCES), source => source.id);
        this.#room.memory.sources = roomSources;
        return _.map(roomSources, sourceId => Game.getObjectById<Source>(sourceId as Id<Source>));
    }

    get #needSpawnHarvester() {
        return this.harvesters.length < this.sources.length;
    }

    spawnHarvester() {
        const spawn = _.first(
            this.#room.find(FIND_MY_STRUCTURES, {
                filter: structure => structure.structureType == STRUCTURE_SPAWN
            })
        );
        if (!spawn) {
            return;
        }

        const expansionHarvester = {
            actions: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
            name: `ExpansionHarvester${this.harvesters.length + 1}`,
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

    run() {
        if (this.#needSpawnHarvester) {
            this.spawnHarvester();
        }

        _.forEach(this.harvesters, harvester => {
            harvester.run();
        });
    }
}
