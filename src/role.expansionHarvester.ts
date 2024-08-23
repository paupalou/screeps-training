import _ from 'lodash';

import { CreepRole } from './creep';

export class ExpansionHarvester extends Creep {
    run() {
        const creep = this;
        if (creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
            creep.say('⛏️ harvest');
        }
        if (!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            creep.memory.transfering = true;
            creep.say('🫳 store');
        }

        let workSpot = creep.memory.workSpot;

        if (creep.memory.transfering) {
            const containerCoords = creep.room.memory.containerBestSpots[creep.memory.sourceId];
            const containerPos: RoomPosition = new RoomPosition(
                containerCoords[0],
                containerCoords[1],
                creep.room.name
            );
            // log(containerPos);
            const positionStructures = containerPos.lookFor(LOOK_STRUCTURES);
            const container = _.find(positionStructures, structure => structure.structureType == STRUCTURE_CONTAINER);
            if (container) {
                creep.transfer(container, RESOURCE_ENERGY);
            }
        } else if (workSpot && (creep.pos.x != workSpot[0] || creep.pos.y != workSpot[1])) {
            creep.moveTo(workSpot[0], workSpot[1], { visualizePathStyle: { stroke: '#ffaa00' } });
        } else if (!workSpot) {
            const otherHarvester = _.find(
                Game.creeps,
                otherHarvester =>
                    otherHarvester.memory.role == CreepRole.EXPANSION_HARVESTER && otherHarvester.id != creep.id
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
}

export default ExpansionHarvester;
