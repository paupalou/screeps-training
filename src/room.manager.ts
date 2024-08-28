import { MineralManager } from './mineral.manager';
import { RoomAnalyst } from './room.analyst';
import { SourceManager } from './source.manager';
import { SpawnQueue } from './spawnQueue';
import { log } from './utils';

function itsMyRoom(room: Room) {
    return room.controller?.my || false;
}

export class RoomManager {
    static start() {
        _.filter(Game.rooms, room => itsMyRoom(room)).forEach(room => {
            log(`======  INIT ROOM ${room.name} ========`);
            const spawnQueue = new SpawnQueue();
            spawnQueue.add(() => 0);
            spawnQueue.add(() => ERR_NOT_ENOUGH_ENERGY);
            spawnQueue.add(() => ERR_BUSY);
            spawnQueue.run();

            RoomAnalyst.work(room);
            new SourceManager(room, spawnQueue);
            MineralManager.work(room);
        });
    }
}
