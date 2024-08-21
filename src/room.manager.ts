export class RoomManager {
    static start() {
        _.forEach(Game.rooms, room => {
            const spawns = room.find(FIND_MY_SPAWNS);

            _.forEach(spawns, spawn => {
                console.log(`Room ${room.name} has spawn ${spawn.name} at (${spawn.pos.x},${spawn.pos.y})`);
            });
        });
    }
}
