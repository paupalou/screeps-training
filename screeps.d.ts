import type { LoDashStatic } from 'lodash';

declare global {
    const _: LoDashStatic;

    interface CreepMemory {
        [name: string]: any;
    }
    interface FlagMemory {
        [name: string]: any;
    }
    interface SpawnMemory {
        [name: string]: any;
    }
    interface RoomMemory {
        [name: string]: any;
    }

    interface Memory {
        [key: string]: any;
    }

    interface Room extends Room {
        spawn: StructureSpawn;
        unfinishedSpawn: StructureSpawn;
        sources: Source[];
        towers: StructureTower[];
    }
}
