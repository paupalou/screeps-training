import _ from 'lodash';

export enum CreepRole {
  HARVESTER = 'harvester',
  BUILDER = 'builder',
  UPGRADER = 'upgrader',
  REPAIRER = 'repairer',
}

export interface BaseCreep {
    role: CreepRole;
    run: (creep: Creep) => void;
}

export function getByRole(role: CreepRole) {
  return _.filter(Game.creeps, creep => creep.memory.role === role);
}

export function count(role: CreepRole) {
  return getByRole(role).length;
}
