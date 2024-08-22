import { CreepRole } from '../creep';
import ExpansionHarvester from '../role.expansionHarvester';
import { SourceArchitect } from './source.architect';

export class MyRoom {
    #room: Room;
    architects: {
        source: SourceArchitect;
    };

    constructor(room: Room) {
        this.#room = room;
        this.architects = {
            source: new SourceArchitect(this)
        };
    }

    get name() {
        return this.#room.name;
    }

    get memory() {
        return this.#room.memory;
    }

    get spawn() {
        const storedSpawn: string | undefined = this.#room.memory.spawn;
        if (storedSpawn) {
            Game.getObjectById<StructureSpawn>(storedSpawn as Id<StructureSpawn>);
        }
        return this.#room.find(FIND_MY_SPAWNS)[0];
    }

    get unfinishedSpawn() {
        return this.#room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: structure => structure.structureType === STRUCTURE_SPAWN
        })[0];
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

    get harvesters(): ExpansionHarvester[] {
        // return _.filter(
        //     Game.creeps,
        //     creep => creep.room.name == this.name && creep.memory.role == CreepRole.EXPANSION_HARVESTER
        // );
        return _.filter(Game.creeps, creep => creep.memory.role == CreepRole.EXPANSION_HARVESTER).map(
            creep => new ExpansionHarvester(creep.id)
        );
    }
}
