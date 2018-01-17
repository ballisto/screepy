require('config');
require('global.utils');
require('global.root.memory');
require('global.economy');
require('global.jobs');
require('global.operator');
require('global.polier');
require('prototype.spawn2')();
require('prototype.creep.functions');
require('prototype.creep.findMyFlag')();
require('prototype.creep.findResource')();
require('prototype.creep');
require('prototype.room');
require('prototype.room.utils');
require('prototype.room.memory');
require('prototype.room.costmatrix');
require('prototype.room.init');
require('prototype.room.defense');
require('prototype.roomposition');
require('prototype.roomobject');
require('prototype.link');
require('functions.game');
require('functions.roles');
require('tower');

global.SERIALIZATION_DELIMITER = "|";
global.DELAYFLOWROOMCHECK = 313;
global.DELAYMARKETAUTOSELL = 7;
global.DELAYMARKETBUY = 3;
global.DELAYFLAGCOLORS = 31;
global.DELAYRESOURCEBALANCING = 9;
global.DELAYROOMSCANNING = 10;
global.DELAYFLAGFINDING = 20;
global.DELAYRESOURCEFINDING = 3;
global.DELAYPANICFLAG = 5;
global.DELAYSPAWNING = 10;
global.DELAYLINK = 2;
global.DELAYPRODUCTION = 7;
global.DELAYLAB = 10;
global.DELAYRCL8INSTALLATION = 100;
global.DELAYDROPPEDENERGY = 3;
global.RESOURCE_SPACE = "space";
global.TERMINAL_PACKETSIZE = 2500; //Size of packets in resource balancing system
global.AUTOSELL_PACKETSIZE = 5000;
global.TERMINALMARKETSTORE = 50000;
global.RBS_PACKETSIZE = 5000;
global.CPU_THRESHOLD = 500;
global.WALLMAX = 5500000;
global.MINSURPLUSENERGY = 100000;
global.LOG_TERMINAL = true;
global.LOG_MARKET = true;
global.LOG_SPAWN = true;
global.LOG_EXPIRE = true;
global.LOG_PANICFLAG = true;
global.LOG_INFO = true;

global.playerUsername = global.playerUsername || _.chain(Game.rooms).map('controller').flatten().filter('my').map('owner.username').first().value();
global.allies = [""];
//global.myroomlist = _.filter(Game.rooms, {controller: { owner: { username: global.playerUsername}}});
global.myroomlist = _.values(Game.rooms).filter (r => _.get(r, ['controller','owner','username'],undefined) === global.playerUsername);
global.myRooms = {};

global.mineralDescriptions = {};
global.mineralDescriptions.H = {tier: 0, component1: false, component2: false };
global.mineralDescriptions.O = {tier: 0, component1: false, component2: false };
global.mineralDescriptions.U = {tier: 0, component1: false, component2: false };
global.mineralDescriptions.K = {tier: 0, component1: false, component2: false };
global.mineralDescriptions.L = {tier: 0, component1: false, component2: false };
global.mineralDescriptions.Z = {tier: 0, component1: false, component2: false };
global.mineralDescriptions.G = {tier: 2, component1: "ZK", component2: "UL" };
global.mineralDescriptions.X = {tier: 0, component1: false, component2: false };
global.mineralDescriptions.OH = {tier: 1, component1: "O", component2: "H" };
global.mineralDescriptions.UH = {tier: 1, component1: "U", component2: "H", bodyPart: ATTACK};
global.mineralDescriptions.UO = {tier: 1, component1: "U", component2: "O", bodyPart: WORK};
global.mineralDescriptions.UL = {tier: 1, component1: "U", component2: "L" };
global.mineralDescriptions.KH = {tier: 1, component1: "K", component2: "H", bodyPart: CARRY};
global.mineralDescriptions.KO = {tier: 1, component1: "K", component2: "O", bodyPart:RANGED_ATTACK};
global.mineralDescriptions.LH = {tier: 1, component1: "L", component2: "H", bodyPart: WORK };
global.mineralDescriptions.LO = {tier: 1, component1: "L", component2: "O", bodyPart: HEAL };
global.mineralDescriptions.ZH = {tier: 1, component1: "Z", component2: "H", bodyPart: WORK };
global.mineralDescriptions.ZO = {tier: 1, component1: "Z", component2: "O", bodyPart: MOVE };
global.mineralDescriptions.ZK = {tier: 1, component1: "Z", component2: "K" };
global.mineralDescriptions.GH = {tier: 1, component1: "G", component2: "H", bodyPart: WORK };
global.mineralDescriptions.GO = {tier: 1, component1: "G", component2: "O", bodyPart: TOUGH };
global.mineralDescriptions.UH2O = {tier: 2, component1: "UH", component2: "OH", bodyPart: ATTACK };
global.mineralDescriptions.UHO2 = {tier: 2, component1: "UO", component2: "OH", bodyPart: WORK };
global.mineralDescriptions.KH2O = {tier: 2, component1: "KH", component2: "OH", bodyPart: CARRY };
global.mineralDescriptions.KHO2 = {tier: 2, component1: "KO", component2: "OH", bodyPart: RANGED_ATTACK };
global.mineralDescriptions.LH2O = {tier: 2, component1: "LH", component2: "OH", bodyPart: WORK };
global.mineralDescriptions.LHO2 = {tier: 2, component1: "LO", component2: "OH", bodyPart: HEAL };
global.mineralDescriptions.ZH2O = {tier: 2, component1: "ZH", component2: "OH", bodyPart: WORK };
global.mineralDescriptions.ZHO2 = {tier: 2, component1: "ZO", component2: "OH", bodyPart: MOVE };
global.mineralDescriptions.GH2O = {tier: 2, component1: "GH", component2: "OH", bodyPart: WORK };
global.mineralDescriptions.GHO2 = {tier: 2, component1: "GO", component2: "OH", bodyPart: TOUGH };
global.mineralDescriptions.XUH2O = {tier: 3, component1: "X", component2: "UH2O", bodyPart: ATTACK };
global.mineralDescriptions.XUHO2 = {tier: 3, component1: "X", component2: "UHO2", bodyPart: WORK };
global.mineralDescriptions.XKH2O = {tier: 3, component1: "X", component2: "KH2O", bodyPart: CARRY };
global.mineralDescriptions.XKHO2 = {tier: 3, component1: "X", component2: "KHO2", bodyPart: RANGED_ATTACK };
global.mineralDescriptions.XLH2O = {tier: 3, component1: "X", component2: "LH2O", bodyPart: WORK };
global.mineralDescriptions.XLHO2 = {tier: 3, component1: "X", component2: "LHO2", bodyPart: HEAL };
global.mineralDescriptions.XZH2O = {tier: 3, component1: "X", component2: "ZH2O", bodyPart: WORK };
global.mineralDescriptions.XZHO2 = {tier: 3, component1: "X", component2: "ZHO2", bodyPart: MOVE };
global.mineralDescriptions.XGH2O = {tier: 3, component1: "X", component2: "GH2O", bodyPart: WORK };
global.mineralDescriptions.XGHO2 = {tier: 3, component1: "X", component2: "GHO2", bodyPart: TOUGH };


global.jobTemplates = {};
global.jobTemplates.transferResource = {task: "transfer", priority: 201, entity: "creep", bodyReq: "20300000", status: "new", ttl: 222 };
global.jobTemplates.withdrawResource = {task: "withdraw", priority: 201, entity: "creep", bodyReq: "20300000", status: "new", ttl: 222 };

global.bodyHitpointsMatrix = [0,100,200,400,800,1200,1600,2000,3000];

global.buildingPlans = {
    miniharvester: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        }],

    remoteHarvester: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 400,
            body: [MOVE, MOVE, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1100,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1650,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2050,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 2050,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 2050,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    harvester: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 350,
            body: [MOVE, MOVE, WORK, WORK, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 700,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1250,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    energyTransporter: [
        {
            //Level 1 (max 300)
            minEnergy: 250,
            body: [MOVE, MOVE, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 450,
            body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 600,
            body: [MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1050,
            body: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    stationaryHarvester: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, WORK, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 750,
            body: [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 850,
            body: [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 850,
            body: [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 850,
            body: [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 850,
            body: [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 850,
            body: [MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY]
        }],

    upgrader: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, WORK, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1250,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        }],

    repairer: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1150,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    builder: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1150,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    wallRepairer: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, WORK, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1150,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    claimer: [
        {
            //Level 1 (max 300)
            minEnergy: 650,
            body: [CLAIM, MOVE]
        },
        {
            //Level 2 (max 550)
            minEnergy: 650,
            body: [CLAIM, MOVE]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [CLAIM, MOVE]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        }],

    bigClaimer: [
        {
            //Level 1 (max 300)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 2 (max 550)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 3 (max 800)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
            // minEnergy: 6500,
            // body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
            // minEnergy: 9750,
            // body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        }],

    protector: [
        {
            //Level 1 (max 300)
            minEnergy: 260,
            body: [MOVE, MOVE, ATTACK, ATTACK]
        },
        {
            //Level 2 (max 550)
            minEnergy: 520,
            body: [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, RANGED_ATTACK]
        },
        {
            //Level 3 (max 800)
            minEnergy: 790,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1760,
            body: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2290,
            body: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1950,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1950,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        }],

    miner: [
        {
            //Level 1 (max 300)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2100,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 2100,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
            // minEnergy: 3300,
            // body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 2100,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
            // minEnergy: 3300,
            // body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    distributor: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 450,
            body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    scientist: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 450,
            body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    demolisher: [
        {
            //Level 1 (max 300)
            minEnergy: 250,
            body: [MOVE, MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 500,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1150,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1400,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1850,
            body: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1850,
            body: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
            // minEnergy: 3150,
            // body: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1850,
            body: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
            // minEnergy: 3150,
            // body: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY]
        }],

    remoteStationaryHarvester: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [WORK, WORK, CARRY, MOVE]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]
        },
        {
            //Level 3 (max 800)
            minEnergy: 700,
            body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 900,
            body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 900,
            body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 900,
            body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 900,
            body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 900,
            body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]
        }],

    SKHarvester: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [WORK, WORK, CARRY, MOVE]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]
        },
        {
            //Level 3 (max 800)
            minEnergy: 700,
            body: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1200,
            body: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1550,
            body: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1550,
            body: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1550,
            body: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        }],

    energyHauler: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [WORK, CARRY, CARRY, MOVE, MOVE]
        },
        {
            //Level 2 (max 550)
            minEnergy: 500,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1100,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1350,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1350,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1350,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1350,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        }],

    transporter: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1350,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 2500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 2500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    SKHauler: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [WORK, CARRY, CARRY, MOVE, MOVE]
        },
        {
            //Level 2 (max 550)
            minEnergy: 500,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1100,
            body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1750,
            body: [WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1750,
            body: [WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1750,
            body: [WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1750,
            body: [WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        }],

    attacker: [
        {
            //Level 1 (max 300)
            minEnergy: 260,
            body: [MOVE, MOVE, ATTACK, ATTACK]
        },
        {
            //Level 2 (max 550)
            minEnergy: 390,
            body: [MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 5 (max 1750)
            minEnergy: 1350,
            body: [TOUGH, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2270,
            body: [TOUGH, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 3040,
            body: [TOUGH, TOUGH, TOUGH, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE, ATTACK, MOVE, MOVE, MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 3040,
            body: [TOUGH, TOUGH, TOUGH, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, MOVE, ATTACK, MOVE, MOVE, MOVE]
        }],

    archer: [
        {
            //Level 1 (max 300)
            minEnergy: 260,
            body: [MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 2 (max 550)
            minEnergy: 390,
            body: [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 5 (max 1750)
            minEnergy: 1350,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2270,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 3040,
            body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 3040,
            body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        }],

    healer: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, HEAL]
        },
        {
            //Level 2 (max 550)
            minEnergy: 300,
            body: [MOVE, HEAL]
        },
        {
            //Level 3 (max 800)
            minEnergy: 600,
            body: [MOVE, MOVE, HEAL, HEAL]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 5 (max 1750)
            minEnergy: 1500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 6 (max 2100)
            minEnergy: 2270,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 5400,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 7500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        }],

    einarr: [
        {
            //Level 1 (max 300)
            minEnergy: 260,
            body: [MOVE, MOVE, ATTACK, ATTACK]
        },
        {
            //Level 2 (max 550)
            minEnergy: 490,
            body: [TOUGH, MOVE, MOVE, MOVE, ATTACK, HEAL]
        },
        {
            //Level 3 (max 800)
            minEnergy: 790,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, HEAL, HEAL]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1290,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL]
        },
        {
            //Level 5 (max 1750)
            minEnergy: 1480,
            body: [MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL]
        },
        {
            //Level 6 (max 2100)
            minEnergy: 1910,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 5220,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 5220,
            body: [TOUGH, HEAL, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, HEAL, MOVE, MOVE]
        }]
};
