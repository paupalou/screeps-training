import Creeps, { CreepRole } from './creep';
import Miner from './role.miner';

export class MineralManager {
    static work(room: Room) {
        if (room.controller && (!room.controller.my || room.controller.level < 6)) {
            return;
        }

        if (MineralManager.needSpawnMiner(room)) {
            MineralManager.spawnMiner(room);
        }

        _.forEach(MineralManager.miners(room), miner => {
            Miner.work(miner);
        });
    }

    static miners(room: Room) {
        return _.filter(Game.creeps, creep => creep.memory.role == CreepRole.MINER && creep.room.name == room.name);
    }

    static needSpawnMiner(room: Room) {
        const noMineralsInRoom = room.minerals.every(mine => mine.mineralAmount == 0);
        if (noMineralsInRoom) {
            return false;
        }

        return MineralManager.miners(room).filter(miner => miner.ticksToLive ?? 0 < 50).length < room.minerals.length;
    }

    static spawnMiner(room: Room) {
        if (!room.spawn) {
            return;
        }

        const actions = [...Array(5).fill(WORK), ...Array(4).fill(CARRY), ...Array(5).fill(MOVE)];
        const miner = {
            actions,
            name: `Miner${MineralManager.miners(room).length + 1}`,
            spawn: room.spawn.name,
            opts: {
                memory: {
                    role: CreepRole.MINER
                }
            }
        };
        if (!room.spawn.spawning) {
            Creeps.create(miner);
        }
    }
}
