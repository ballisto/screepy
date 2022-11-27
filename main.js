let cpu = Game.cpu.getUsed();
// console.log("CPU@Start: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);

const CPUdebug = false;

require("globals");
// global._ = require('myLodash');

global.reqCPU = Game.cpu.getUsed();
global.start = Game.time;
// console.log('CPU@Initialization: ' + (global.reqCPU - cpu) + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);

const profiler = require('screeps-profiler'); // cf. https://www.npmjs.com/package/screeps-profiler
profiler.enable() ;

module.exports.loop = function() {
    profiler.wrap(function() {
        let cpu = Game.cpu.getUsed();
        if (Game.time == global.start) { cpu -= global.reqCPU; }
        if (cpu >= 35) {
            console.log("<font color=#ff0000 type='highlight'>CPU@LoopStart: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket +"</font>");
            //return;
        }

        PathFinder.use(true);

        operator.init();
        polier.init();

        global.economy = new Economy();

        if(Game.time % 4 == 0) {
            operator.run();
            jobs.run();        
        }

        polier.run();

        var CPUdebugString = "CPU Debug<br><br>";
        if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start: " + Game.cpu.getUsed())}

        let scheduler = new Scheduler();
        scheduler.run();

        for (let f in Game.flags) {
            let curFlag = Game.flags[f];
            curFlag.run();
        }



        let buyFlag = false;
        let buyRoom = 'W58N12';
        let buyResourceType = 'L';
        let buyThresholdPrice = 0.2;
        let buyTresholdTotalStockAmount = 500000;
        
        const buyByRoom = false;
        const curResource = 'L';
        const curBuyPrice = 0.11;
        
        
        
        if (global.lastResetTick == undefined) {
            console.log ("Global reset! Tick: " + Game.time + " - TimeDiff: " + Game.time - Memory.lastResetTick);
            global.lastResetTick = Game.time;
            
            Memory.lastResetTick = Game.time;
        }

        

        if (cache != undefined && cache.rooms != undefined) {
            for (let c in cache.rooms) {
                cache.rooms[c].factoryInstance = undefined;
            }
        }

        // let BuyOrders = _.filter(Game.market.orders, (o) => o.roomName != undefined && o.type == 'buy' && o.resourceType == 'K' && o.price < 0.09);
        // for ( let o in BuyOrders) {
        //     Game.market.changeOrderPrice(BuyOrders[o].id, 0.09);
        // }

        // let tmpconst = Game.rooms['W57N19'].find(FIND_CONSTRUCTION_SITES);
        // for ( let c in tmpconst ) {
        //     tmpconst[c].remove();
        // }
        

        let powerCreepSpawnRoomName = 'W53N18';
        let powerCreepName = 'Dozer';
        let Dozer = Game.powerCreeps[powerCreepName];
        if(Game.time % 111 == 0) {
            
            
            let powerSpawn = Game.rooms[powerCreepSpawnRoomName].find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_POWER_SPAWN } });
            if ( powerSpawn.length != undefined && powerSpawn.length > 0) {
                powerSpawn = powerSpawn[0];
            }
            if( powerSpawn != undefined) {
                if(!(Game.powerCreeps[powerCreepName].spawnCooldownTime > Date.now())) {
                    Game.powerCreeps[powerCreepName].spawn(powerSpawn);
                }
            }
        }
        try {
            if ( Dozer.ticksToLive < 222 ) {
                let powerSpawn = Game.rooms[powerCreepSpawnRoomName].find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_POWER_SPAWN } });
                if ( powerSpawn.length != undefined && powerSpawn.length > 0) {
                    powerSpawn = powerSpawn[0];
                }
                if( powerSpawn != undefined) {
                    if ( Dozer.renew(powerSpawn) == ERR_NOT_IN_RANGE) {
                        Dozer.moveTo(powerSpawn);    
                    }
                }
            }
            else if( !Game.rooms[powerCreepSpawnRoomName].controller.isPowerEnabled ) {
                if ( Dozer.enableRoom(Game.rooms[powerCreepSpawnRoomName].controller) == ERR_NOT_IN_RANGE) {
                        Dozer.moveTo(Game.rooms[powerCreepSpawnRoomName].controller);    
                    }
            }
            else {
                // Dozer.storeAllBut();
                
                
                if(Dozer.powers[PWR_OPERATE_STORAGE] != undefined) {
                    // console.log(JSON.stringify(Game.rooms[powerCreepSpawnRoomName].storage.effects));
                    if ( Dozer.powers[PWR_OPERATE_STORAGE].cooldown === 0 && Game.rooms[powerCreepSpawnRoomName].storage != undefined) {
                        let storageEffectTicksRemaining = 0;
                        if ( Game.rooms[powerCreepSpawnRoomName].storage.effects != undefined ) {
                            let storageEffectInfo = _.filter(Game.rooms[powerCreepSpawnRoomName].storage.effects, (e) => e.power == PWR_OPERATE_STORAGE);
                            if (storageEffectInfo.length == 1) {
                                storageEffectTicksRemaining = storageEffectInfo[0].ticksRemaining;
                                // console.log(storageEffectTicksRemaining);
                            }
                        }
                        if ( storageEffectTicksRemaining < 20 ) {
                            let usePowerStorageResult = Dozer.usePower(PWR_OPERATE_STORAGE, Game.rooms[powerCreepSpawnRoomName].storage);
                            
                            if ( usePowerStorageResult === ERR_NOT_IN_RANGE ) {
                                Dozer.moveTo(Game.rooms[powerCreepSpawnRoomName].storage);
                            }
                            else if ( usePowerStorageResult === ERR_NOT_ENOUGH_RESOURCES ) {
                                // Dozer.say(Game.rooms[powerCreepSpawnRoomName].storage.store[RESOURCE_OPS]);
                                if (Game.rooms[powerCreepSpawnRoomName].storage.store[RESOURCE_OPS] > 0) {
                                    Dozer.say(Dozer.withdraw(Game.rooms[powerCreepSpawnRoomName].storage, RESOURCE_OPS, 100 - Dozer.carry[RESOURCE_OPS]));
                                }
                            }
                            else {
                                Dozer.say(usePowerStorageResult);
                            }
                        }
                    }
                }
                if ( Dozer.powers[PWR_OPERATE_TERMINAL] != undefined && Dozer.powers[PWR_OPERATE_TERMINAL].cooldown === 0 && Game.rooms[powerCreepSpawnRoomName].terminal != undefined) {
                    // console.log(JSON.stringify(Game.rooms[powerCreepSpawnRoomName].storage.effects));
                    if ( Dozer.powers[PWR_OPERATE_TERMINAL].cooldown === 0 && Game.rooms[powerCreepSpawnRoomName].terminal != undefined) {
                        let terminalEffectTicksRemaining = 0;
                        if ( Game.rooms[powerCreepSpawnRoomName].terminal.effects != undefined ) {
                            let terminalEffectInfo = _.filter(Game.rooms[powerCreepSpawnRoomName].terminal.effects, (e) => e.power == PWR_OPERATE_TERMINAL);
                            if (terminalEffectInfo.length == 1) {
                                terminalEffectTicksRemaining = terminalEffectInfo[0].ticksRemaining;
                                // console.log(storageEffectTicksRemaining);
                            }
                        }
                        if ( terminalEffectTicksRemaining < 20 ) {
                            let usePowerTerminalResult = Dozer.usePower(PWR_OPERATE_TERMINAL, Game.rooms[powerCreepSpawnRoomName].terminal);
                            
                            if ( usePowerTerminalResult === ERR_NOT_IN_RANGE ) {
                                Dozer.moveTo(Game.rooms[powerCreepSpawnRoomName].terminal);
                            }
                            else if ( usePowerTerminalResult === ERR_NOT_ENOUGH_RESOURCES ) {
                                // Dozer.say(Game.rooms[powerCreepSpawnRoomName].storage.store[RESOURCE_OPS]);
                                if (Game.rooms[powerCreepSpawnRoomName].storage.store[RESOURCE_OPS] > 0) {
                                    Dozer.say(Dozer.withdraw(Game.rooms[powerCreepSpawnRoomName].storage, RESOURCE_OPS, 100 - Dozer.carry[RESOURCE_OPS]));
                                }
                            }
                            else {
                                Dozer.say(usePowerTerminalResult);
                            }
                        }
                    }
                }
                // Dozer.moveTo(Game.rooms[powerCreepSpawnRoomName].storage);   
                if(Dozer.powers[PWR_GENERATE_OPS] != undefined && Dozer.powers[PWR_GENERATE_OPS].cooldown === 0) {
                    
                    if ( Dozer.isFull() ) { Dozer.storeAllBut(); }
                    else { Dozer.say(Dozer.usePower(PWR_GENERATE_OPS)); }
                }
                // console.log(JSON.stringify(Dozer.powers));
            }
        }
        catch (err) {
            console.log(err);
        }
        
        
        let powerSpawns = _.filter(Game.structures, (a) => a.structureType == STRUCTURE_POWER_SPAWN && a.power > 0 && a.energy >= 50 );
        for (let p in powerSpawns) {
            if(powerSpawns[p].room.totalResourceInStock(RESOURCE_ENERGY) > 350000)
                powerSpawns[p].processPower();
        }

        
            let terminal = Game.rooms[buyRoom].terminal;
                if(buyFlag && Game.time % global.DELAYMARKETBUY == 0 && (terminal.cooldown == undefined || terminal.cooldown == 0) ) {
                    
                    let sellOrdersBelowThreshold = Game.market.getAllOrders((o) => o.type == 'sell' && o.resourceType == buyResourceType && o.price <= buyThresholdPrice && o.amount > 100);
                    sellOrdersBelowThreshold = _.sortBy(sellOrdersBelowThreshold, "price");
                
                    if(economy.stock[buyResourceType] < buyTresholdTotalStockAmount && sellOrdersBelowThreshold.length > 0) {
                            let dealAmount = sellOrdersBelowThreshold[0].amount;
                            if (dealAmount > 22222) {dealAmount = 22222;}
                            let dealResult = Game.market.deal(sellOrdersBelowThreshold[0].id,dealAmount,buyRoom);
                            
                            console.log(sellOrdersBelowThreshold[0].id + " - "  + sellOrdersBelowThreshold[0].price + ' - ' + economy.stock[buyResourceType]);
                        
                    }
                }
                
        let sellFlag = false;
        let sellRoom = 'W53N18';
        
        //   console.log(economy.stock['K']);
        
        let sellResourceType = 'O';
        let sellThresholdPrice = 0.05;
        let sellTresholdTotalStockAmount = 500000;
            let sellTerminal = Game.rooms[sellRoom].terminal;
                if(sellFlag && Game.time % global.DELAYMARKETBUY == 0 && sellTerminal.store[sellResourceType] != undefined && sellTerminal.store[sellResourceType] > 5000 && (sellTerminal.cooldown == undefined || sellTerminal.cooldown == 0) ) {
                    
                    let buyOrdersBelowThreshold = Game.market.getAllOrders((o) => o.type == 'buy' && o.resourceType == sellResourceType && o.price >= sellThresholdPrice && o.amount > 100);
                    buyOrdersBelowThreshold = _.sortBy(buyOrdersBelowThreshold, "price");
                    buyOrdersBelowThreshold.reverse();
                
                    if(economy.stock[sellResourceType] > sellTresholdTotalStockAmount && buyOrdersBelowThreshold.length > 0) {
                            let sellDealAmount = buyOrdersBelowThreshold[0].amount;
                            if (sellDealAmount > 5000) {sellDealAmount = 5000;}
                            let sellDealResult = Game.market.deal(buyOrdersBelowThreshold[0].id,sellDealAmount,sellRoom);
                            
                            console.log(sellRoom + " - "  + sellResourceType + " - "  + sellDealAmount + " - "  + buyOrdersBelowThreshold[0].price + ' - ' + economy.stock[sellResourceType]);
                        
                    }
                }
            
        //     let activeSegments = [];
        //   for (let r in RawMemory.segments) {
        // //       if (RawMemory.segments[r] != undefined) {console.log("Segment: " + r + " - kilobytes:" + (RawMemory.segments[r].length * 2) /1024);}
        //          if (RawMemory.segments[r] != undefined) { activeSegments.push(r); }
        //   }
        //   for ( let mr in Memory.rooms) {
        //       if(Memory.rooms[mr].segment != undefined && !activeSegments.includes(Memory.rooms[mr].segment)) {console.log("Room" + mr + " - Segment - " + Memory.rooms[mr].segment);}
        //   }
        //   console.log(activeSegments)
        //   console.log(activeSegments.includes('9'));
        //   for (let r in Game.rooms) {
        //     //   if (curRoom.memory.segment != undefined) {console.log("Room: " + r + " - segement:" + curRoom.memory.segment);}
        //     // let curRoomMemory = Game.rooms[r].memory;
        //     let curRoomMemory = Game.rooms[r].memory;
        //     if(curRoomMemory.boostLabs != undefined) {
        //         for (let b in curRoomMemory.boostLabs) {
        //             if(curRoomMemory.boostLabs[b] == 'GH2O') {
        //                 let curBoostLab = Game.getObjectById(b);
        //                 // if(curBoostLab != undefined && curBoostLab.mineralAmount == 0) {
        //                 {
        //                     // console.log(curBoostLab.room.name)
        //                     curRoomMemory.boostLabs[b] = 'LH2O';
        //                 }
                        
        //             }
                    
        //         }
        //         // 
        //     }
        //   }
        //   console.log(LZString.compress("0123456"));
            // RawMemory.segments[14] = LZString.compress("0123456");
            // console.log(LZString.decompress(RawMemory.segments[14]));
            // console.log((RawMemory.get().length )/1024);
            // let tmpChar = "A";
            // console.log(tmpChar.length);

        
        
        //   let commando1 = new Commando(1);
        
        //  let blockersW58S2 = _.filter(Game.creeps, (c) => c.room.name == 'W58S2' && c.memory.role != undefined && c.memory.role == 'blocker');
        //   for (t in blockersW58S2) {
        //       commando1.recruit(blockersW58S2[t]);
        //   }
        //   commando1.setMission('moveTo');
        //   commando1.setTargetPos('W58S1',22,22);
        //     commando1.executeMission();
        //   console.log(commando1.size)
        //   let tmpRoads = _.filter(Game.rooms['W56S2'].find(FIND_STRUCTURES), (s) => s.room.name == 'W56S2' && s.structureType == STRUCTURE_ROAD);
        //   for (let r in tmpRoads ) {
        //     //   console.log(tmpRoads[r].room)
        //     tmpRoads[r].destroy();
        //   }

        // for(let r in Memory.rooms.W59S1.resourceLimits) {
        //     // Memory.rooms.W59S1.resourceLimits[r].maxStorage = 0;
        //     // console.log(Memory.rooms.W59S1.resourceLimits[r].maxStorage);
        // }


                     
            
            
            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start cycling through rooms: " + Game.cpu.getUsed())}
                // Cycle through rooms
            if(buyByRoom) {
                for (var r in Game.rooms) {
                    let curRoom = Game.rooms[r];            
                    
                    if(curRoom.my() && curRoom.terminal != undefined && curRoom.terminal != undefined && curRoom.terminal.owner.username == global.playerUsername) {
                        
                        if(curRoom.memory.resourceLimits != undefined && curRoom.memory.resourceLimits[curResource] != undefined && curRoom.memory.resourceLimits[curResource].maxStorage != undefined) {
                            let curResourceDelta = curRoom.totalResourceInStock(curResource) - curRoom.memory.resourceLimits[curResource].maxStorage;
                            if (curResourceDelta <= -1000) {
                                let curRoomBuyOrders = _.filter(Game.market.orders, (o) => o.roomName == curRoom.name && o.type == 'buy' && o.resourceType == curResource);
                                if(curRoomBuyOrders.length == 0) {
                                    let curResourceBuyQty = ((curResourceDelta) * -1) + 5000;
                                    let createBuyOrderResult = Game.market.createOrder(ORDER_BUY ,curResource, curBuyPrice, curResourceBuyQty, curRoom.name);
                                    if (createBuyOrderResult == 0) {curRoom.log("Buy order created", curResource, curBuyPrice);}
                                    else {curRoom.log("Buy order create failed. result:", createBuyOrderResult);}
                                }
                            }
                        }
                    }
                }   
            }
        
            
            //console.log("Tickli - " + Game.cpu.tickLimit);
            // console.log("main Finish: " + Game.cpu.getUsed());
            // root.saveMemorySegments();
            
            if (CPUdebug == true) {
                CPUdebugString = CPUdebugString.concat("<br>Finish: " + Game.cpu.getUsed());
                console.log(CPUdebugString);
            }

        });
};
