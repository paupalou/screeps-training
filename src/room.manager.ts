import { RoomAnalyst } from './room.analyst';
import { SourceManager } from './source.manager';

function itsMyRoom(room: Room) {
    return room.controller?.my || false;
}

export class RoomManager {
    static start() {
        _.filter(Game.rooms, room => itsMyRoom(room)).forEach(room => {
            RoomAnalyst.work(room);
            // log(`====== Room ${room.name} ======`);
            // log(this.analyst.sourceContainerSpots);
            // log(`=====================`);
            new SourceManager(room);
        });
    }
}
