import type { LoDashStatic } from 'lodash';

enum CreepRole {
    HARVESTER = 'harvester',
    BUILDER = 'builder',
    UPGRADER = 'upgrader',
    REPAIRER = 'repairer',
    TRANSPORTER = 'transporter',
    STEALER = 'stealer',
    CLAIMER = 'claimer',
    INVADER = 'invader',
    MINER = 'miner',
    // Expansion temporal types
    EXPANSION_BUILDER = 'expansion_builder',
    EXPANSION_HARVESTER = 'expansion_harvester',
    EXPANSION_ENERGY_BALANCER = 'expansion_energy_balancer',
    EXPANSION_REPAIRER = 'expansion_repairer',
    EXPANSION_UPGRADER = 'expansion_upgrader'
}

declare global {
    const _: LoDashStatic;

    interface CreepMemory {
      role: CreepRole;
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
