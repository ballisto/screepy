StructureLink.prototype.getPriority =
    function () {
      if ( this.room.memory.links[this.id] != undefined && this.room.memory.links[this.id].priority != undefined) {
        return this.room.memory.links[this.id].priority;
      }
      else {
        return 0;
      }
    };
StructureLink.prototype.getLinkIdsWithHigherPriority =
    function () {
      var resultArray = {};
      var myPriority = this.getPriority();

      for (var linkId in this.room.memory.links) {
          if (this.room.memory.links[linkId].priority != undefined && this.room.memory.links[linkId].priority > myPriority) {
            resultArray.push(linkId);
          }
        }
      return resultArray;
    };
StructureLink.prototype.getTargetLink =
    function () {
      var linkIdsWithHigherPriority = this.getLinkIdsWithHigherPriority();

      var targetLinkPriorities = {};

      for (var linkId in linkIdsWithHigherPriority) {
          var link = Game.getObjectById(linkId);
          if ( link != undefined) {
            var tmpPrioArray = { priority: Game.rooms[r].memory.links[linkId].priority, id: linkId };
            targetLinkPriorities[linkId] = tmpPrioArray;
          }
        }
        if (targetLinkPriorities.length > 0) {
          targetLinkPriorities = _.sortBy(targetLinkPriorities, "priority");
          targetLinkPriorities = _.reverse(targetLinkPriorities);

          //loop thru links, high prio to low 
          for(let l=0; l<targetLinkPriorities.length; l++) {

            var possibleTarget = Game.getObjectById(targetLinkPriorities[l].id);
            if( (possibleTarget.energyCapacity - possibleTarget.energy) > 50 ) {
              return possibleTarget;
            }
          }
      }
    };
