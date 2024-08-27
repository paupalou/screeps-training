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

    interface Creep extends Creep {
        closestContainer: StructureContainer;
    }

    interface Room extends Room {
        spawn: StructureSpawn;
        unfinishedSpawn: StructureSpawn;
        sources: Source[];
        minerals: Mineral[];
        towers: StructureTower[];
        storage: StructureStorage;
    }
}
