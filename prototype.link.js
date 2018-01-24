StructureLink.prototype.getPriority =
    function () {

      if ( this.room.memory != undefined && this.room.memory.links != undefined && this.room.memory.links[this.id] != undefined && this.room.memory.links[this.id].priority != undefined) {
        return this.room.memory.links[this.id].priority;
      }
      else {
        return 0;
      }
    };
StructureLink.prototype.getLinkIdsWithHigherPriority =
    function () {
      var resultArray = [];
      var myPriority = this.getPriority();

      for (var linkId in this.room.memory.links) {
          if ( this.room.memory != undefined && this.room.memory.links != undefined && this.room.memory.links[linkId].priority != undefined && this.room.memory.links[linkId].priority > myPriority) {
            resultArray.push(linkId);
          }
        }
      return resultArray;
    };
StructureLink.prototype.takeEnergy =
    function () {
      if(this.getPriority() == 1 && this.getTargetLink() == undefined) {
        return true;
      }
      else {
        return false;
      }
    }
StructureLink.prototype.bringEnergy =
    function () {
      if(this.getPriority() == 1 && this.getTargetLink() != undefined) {
        return true;
      }
      else {
        return false;
      }
    }
StructureLink.prototype.getTargetLink =
    function () {
      var linkIdsWithHigherPriority = this.getLinkIdsWithHigherPriority();

      var targetLinkPriorities = {};

      for (var linkId in linkIdsWithHigherPriority) {
          var tmpLinkId = linkIdsWithHigherPriority[linkId];
          var link = Game.getObjectById(tmpLinkId);
          if ( link != undefined) {
            var tmpPrioArray = { priority: this.room.memory.links[tmpLinkId].priority, id: tmpLinkId };
            targetLinkPriorities[tmpLinkId] = tmpPrioArray;
          }
        }
        targetLinkPriorities = _.sortBy(targetLinkPriorities, "priority");
        targetLinkPriorities = targetLinkPriorities.reverse();

        if (targetLinkPriorities.length > 0) {
          //loop thru links, high prio to low
          for(let l=0; l<targetLinkPriorities.length; l++) {
            var possibleTarget = Game.getObjectById(targetLinkPriorities[l].id);
            if( (possibleTarget.energyCapacity - possibleTarget.energy) > 50 ) {
              return possibleTarget;
            }
          }
      }
    };
