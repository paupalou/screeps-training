import { RoomAnalyst } from './room.analyst';
import { SourceManager } from './source.manager';

class MyRoom {
    #room: Room;
    analyst: RoomAnalyst;
    sourceManager: SourceManager | null;

    constructor(room: Room) {
        this.#room = room;
        this.analyst = new RoomAnalyst(room);
        // log(`====== Room ${room.name} ======`); 
        // log(this.analyst.sourceContainerSpots);
        // log(`=====================`); 
        this.sourceManager = new SourceManager(room);
    }
}

function itsMyRoom(room: Room) {
    return room.controller?.my;
}

export class RoomManager {
    static start() {
        _.forEach(Game.rooms, room => itsMyRoom(room) && new MyRoom(room));
    }
}
