global.Commando = class Commando {
    constructor(commandoId) {
        this.id = commandoId;
        this.size = 0;
        
        if(Memory.commandos[commandoId] == undefined) {
            Memory.commandos[commandoId] = {};
            Memory.commandos[commandoId].members = {};
            Memory.commandos[commandoId].mission = 'none';
            Memory.commandos[commandoId].status = 'accomplished';
        }
        else {
            this.members = [];
            for(let m in Memory.commandos[commandoId].members) {
                let curMemberCreep = Game.getObjectById(m);
                if( curMemberCreep != undefined) {
                    this.members.push(curMemberCreep);
                    this.size += 1;
                }
            }
        }
        this.memory = Memory.commandos[commandoId];
        this.mission = this.memory.mission;
        this.status = this.memory.status;
        if(this.memory.targetRoomName != undefined) {this.targetRoomName = this.memory.targetRoomName};
        if(this.memory.targetX != undefined) {this.targetX = this.memory.targetX};
        if(this.memory.targetY != undefined) {this.targetY = this.memory.targetY};
    }
    
    recruit(screep) {
        this.members.push(screep);
        if (this.memory.members[screep.id] == undefined) {
            this.memory.members[screep.id] = screep.name;
        }
    }
    setMission(newMission) {
        this.mission = newMission;
        this.memory.mission = newMission;
        this.memory.status = 'go';
        this.status = 'go';

    }

    setTargetPos(posRoomName, posX, posY) {
        this.targetRoomName = posRoomName;
        this.targetX = posX;
        this.targetY = posY;
        this.memory.targetRoomName = posRoomName;
        this.memory.targetX = posX;
        this.memory.targetY = posY;
    }

    executeMission() {
        switch (this.mission) {
            case 'none' :
            break;
            case 'moveTo' :
                if (this.targetRoomName != undefined && this.targetX != undefined && this.targetY != undefined) {
                    this.move(new RoomPosition(this.targetX, this.targetY, this.targetRoomName));
                }
            break;

            default :
            break;
        }


    }
    move(roomPosition) {
        for (let m in this.members) {
            this.members[m].moveTo(roomPosition);
        }

    }
};