import { CreepRole } from "./creep";

export default {
    work(creep: Creep) {
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
            creep.say('⛏️ harvest');
        }
        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
            creep.say('🫳 store');
        }

        const workSpot = creep.memory.workSpot;

        if (creep.memory.transfering) {
            const containerCoords = creep.room.memory.containerSpots[creep.memory.sourceId];
            const containerPos: RoomPosition = new RoomPosition(
                containerCoords[0],
                containerCoords[1],
                creep.room.name
            );

            const positionStructures = containerPos.lookFor(LOOK_STRUCTURES);
            const container = _.find(positionStructures, structure => structure.structureType == STRUCTURE_CONTAINER);
            // if (!container) {
            //   _.forEach(positionStructures, (c) => {
            //       log(`no container in ${c.pos.x},${c.pos.y}`)
            //   })
            // }
            if (container) {
                const transferAction = creep.transfer(container, RESOURCE_ENERGY);
                if (transferAction == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
            }
        } else if (workSpot && (creep.pos.x != workSpot[0] || creep.pos.y != workSpot[1])) {
            creep.moveTo(workSpot[0], workSpot[1], { visualizePathStyle: { stroke: '#ffaa00' } });
        } else if (!workSpot) {
            const otherHarvester = _.find(
                Game.creeps,
                otherHarvester =>
                    otherHarvester.room.name == creep.room.name &&
                    otherHarvester.memory.role == CreepRole.EXPANSION_HARVESTER &&
                    otherHarvester.id != creep.id
            );
            const nonUsedSourceId = _.find(
                Object.keys(creep.room.memory.harvestSpots),
                sourceId => sourceId != otherHarvester?.memory.sourceId
            );
            if (nonUsedSourceId) {
                creep.memory.sourceId = nonUsedSourceId;
                creep.memory.workSpot = creep.room.memory.harvestSpots[nonUsedSourceId];
            }
        } else {
            const source = Game.getObjectById(creep.memory.sourceId as Id<Source>);
            source && creep.harvest(source);
        }
    }
};
