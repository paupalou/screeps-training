import { log } from './utils';

export class MineralManager {
    static work(room: Room) {
        if (room.controller && room.controller.level < 6) {
            return;
        }

        log(`Mineral manager working for ${room.name}`);
    }
}
