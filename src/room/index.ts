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
            source: new SourceArchitect(room)
        };
        this.#init();
    }

    #init() {
    }

    get name() {
        return this.#room.name;
    }

    get memory() {
        return this.#room.memory;
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
