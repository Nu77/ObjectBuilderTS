"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectBuilderWorker = void 0;
const events_1 = require("events");
const WorkerCommunicator_1 = require("../../workers/WorkerCommunicator");
const ByteArray_1 = require("../../otlib/utils/ByteArray");
const ThingTypeStorage_1 = require("../../otlib/things/ThingTypeStorage");
const SpriteStorage_1 = require("../../otlib/sprites/SpriteStorage");
const Version_1 = require("../../otlib/core/Version");
const ObjectBuilderSettings_1 = require("../settings/ObjectBuilderSettings");
const Resources_1 = require("../../otlib/resources/Resources");
const ClientInfo_1 = require("../../otlib/utils/ClientInfo");
const FrameDuration_1 = require("../../otlib/animation/FrameDuration");
const FrameGroup_1 = require("../../otlib/animation/FrameGroup");
const PathHelper_1 = require("../../otlib/loaders/PathHelper");
const SpriteData_1 = require("../../otlib/sprites/SpriteData");
const ThingData_1 = require("../../otlib/things/ThingData");
const ThingListItem_1 = require("../../otlib/utils/ThingListItem");
const ThingProperty_1 = require("../../otlib/things/ThingProperty");
const ThingType_1 = require("../../otlib/things/ThingType");
const ThingCategory_1 = require("../../otlib/things/ThingCategory");
const FrameGroupType_1 = require("../../otlib/things/FrameGroupType");
const VersionStorage_1 = require("../../otlib/core/VersionStorage");
const SpriteDimensionStorage_1 = require("../../otlib/core/SpriteDimensionStorage");
const SpriteExtent_1 = require("../../otlib/utils/SpriteExtent");
const StorageEvent_1 = require("../../otlib/storages/events/StorageEvent");
const ProgressEvent_1 = require("../../otlib/events/ProgressEvent");
const ProgressBarID_1 = require("../commands/ProgressBarID");
const ProgressCommand_1 = require("../commands/ProgressCommand");
const HideProgressBarCommand_1 = require("../commands/HideProgressBarCommand");
const SettingsCommand_1 = require("../commands/SettingsCommand");
const LoadVersionsCommand_1 = require("../commands/LoadVersionsCommand");
const LoadSpriteDimensionsCommand_1 = require("../commands/LoadSpriteDimensionsCommand");
const SetSpriteDimensionCommand_1 = require("../commands/SetSpriteDimensionCommand");
const CreateNewFilesCommand_1 = require("../commands/files/CreateNewFilesCommand");
const LoadFilesCommand_1 = require("../commands/files/LoadFilesCommand");
const MergeFilesCommand_1 = require("../commands/files/MergeFilesCommand");
const CompileCommand_1 = require("../commands/files/CompileCommand");
const CompileAsCommand_1 = require("../commands/files/CompileAsCommand");
const UnloadFilesCommand_1 = require("../commands/files/UnloadFilesCommand");
const NewThingCommand_1 = require("../commands/things/NewThingCommand");
const UpdateThingCommand_1 = require("../commands/things/UpdateThingCommand");
const ImportThingsCommand_1 = require("../commands/things/ImportThingsCommand");
const ImportThingsFromFilesCommand_1 = require("../commands/things/ImportThingsFromFilesCommand");
const ExportThingCommand_1 = require("../commands/things/ExportThingCommand");
const ReplaceThingsCommand_1 = require("../commands/things/ReplaceThingsCommand");
const ReplaceThingsFromFilesCommand_1 = require("../commands/things/ReplaceThingsFromFilesCommand");
const DuplicateThingCommand_1 = require("../commands/things/DuplicateThingCommand");
const RemoveThingCommand_1 = require("../commands/things/RemoveThingCommand");
const GetThingCommand_1 = require("../commands/things/GetThingCommand");
const GetThingListCommand_1 = require("../commands/things/GetThingListCommand");
const FindThingCommand_1 = require("../commands/things/FindThingCommand");
const OptimizeFrameDurationsCommand_1 = require("../commands/things/OptimizeFrameDurationsCommand");
const ConvertFrameGroupsCommand_1 = require("../commands/things/ConvertFrameGroupsCommand");
const NewSpriteCommand_1 = require("../commands/sprites/NewSpriteCommand");
const ImportSpritesCommand_1 = require("../commands/sprites/ImportSpritesCommand");
const ImportSpritesFromFileCommand_1 = require("../commands/sprites/ImportSpritesFromFileCommand");
const ExportSpritesCommand_1 = require("../commands/sprites/ExportSpritesCommand");
const ReplaceSpritesCommand_1 = require("../commands/sprites/ReplaceSpritesCommand");
const ReplaceSpritesFromFilesCommand_1 = require("../commands/sprites/ReplaceSpritesFromFilesCommand");
const RemoveSpritesCommand_1 = require("../commands/sprites/RemoveSpritesCommand");
const GetSpriteListCommand_1 = require("../commands/sprites/GetSpriteListCommand");
const FindSpritesCommand_1 = require("../commands/sprites/FindSpritesCommand");
const OptimizeSpritesCommand_1 = require("../commands/sprites/OptimizeSpritesCommand");
const NeedToReloadCommand_1 = require("../commands/NeedToReloadCommand");
const SetClientInfoCommand_1 = require("../commands/SetClientInfoCommand");
const FindResultCommand_1 = require("../commands/FindResultCommand");
const SetThingDataCommand_1 = require("../commands/things/SetThingDataCommand");
const SetThingListCommand_1 = require("../commands/things/SetThingListCommand");
const SetSpriteListCommand_1 = require("../commands/sprites/SetSpriteListCommand");
const ClientMerger_1 = require("../../otlib/utils/ClientMerger");
const OTFI_1 = require("../../otlib/utils/OTFI");
const OBDVersions_1 = require("../../otlib/obd/OBDVersions");
const OBDEncoder_1 = require("../../otlib/obd/OBDEncoder");
const ObUtils_1 = require("../utils/ObUtils");
const BitmapData_1 = require("../../otlib/utils/BitmapData");
const ThingDataLoader_1 = require("../../otlib/loaders/ThingDataLoader");
const ThingUtils_1 = require("../../otlib/utils/ThingUtils");
const FrameDurationsOptimizer_1 = require("../../otlib/utils/FrameDurationsOptimizer");
const FrameGroupsConverter_1 = require("../../otlib/utils/FrameGroupsConverter");
const SpritesFinder_1 = require("../utils/SpritesFinder");
const SpritesOptimizer_1 = require("../../otlib/utils/SpritesOptimizer");
const SpriteDataLoader_1 = require("../../otlib/loaders/SpriteDataLoader");
const SaveHelper_1 = require("../utils/SaveHelper");
const ImageCodec_1 = require("../../otlib/utils/ImageCodec");
const OTFormat_1 = require("../../otlib/utils/OTFormat");
const OptimizeFrameDurationsResultCommand_1 = require("../commands/things/OptimizeFrameDurationsResultCommand");
const ConvertFrameGroupsResultCommand_1 = require("../commands/things/ConvertFrameGroupsResultCommand");
const OptimizeSpritesResultCommand_1 = require("../commands/sprites/OptimizeSpritesResultCommand");
const path = __importStar(require("path"));
class ObjectBuilderWorker extends events_1.EventEmitter {
    //--------------------------------------
    // Getters / Setters
    //--------------------------------------
    get clientChanged() {
        return ((this._things && this._things.changed) || (this._sprites && this._sprites.changed)) ?? false;
    }
    get clientIsTemporary() {
        return (this._things && this._things.isTemporary && this._sprites && this._sprites.isTemporary) || false;
    }
    get clientLoaded() {
        return (this._things && this._things.loaded && this._sprites && this._sprites.loaded) || false;
    }
    //--------------------------------------------------------------------------
    // CONSTRUCTOR
    //--------------------------------------------------------------------------
    constructor() {
        super();
        this._things = null;
        this._sprites = null;
        this._datFile = null;
        this._sprFile = null;
        this._version = null;
        this._extended = false;
        this._transparency = false;
        this._improvedAnimations = false;
        this._frameGroups = false;
        this._errorMessage = null;
        this._compiled = false;
        this._isTemporary = false;
        this._thingListAmount = 100;
        this._spriteListAmount = 100;
        this._settings = null;
        this._communicator = new WorkerCommunicator_1.WorkerCommunicator();
        this._thingListAmount = 100;
        this._spriteListAmount = 100;
        this.register();
    }
    //--------------------------------------------------------------------------
    // METHODS
    //--------------------------------------------------------------------------
    //--------------------------------------
    // Public
    //--------------------------------------
    // getThingCallback is defined later as private - this public one is for external use
    getThingCallbackPublic(id, category) {
        this.sendThingData(id, category);
    }
    compileCallback() {
        if (this._datFile && this._sprFile && this._version) {
            this.compileAsCallback(this._datFile, this._sprFile, this._version, this._extended, this._transparency, this._improvedAnimations, this._frameGroups);
        }
    }
    setSelectedThingIds(value, category) {
        if (value && value.length > 0) {
            if (value.length > 1) {
                value.sort((a, b) => b - a); // DESCENDING
            }
            if (this._things) {
                const max = this._things.getMaxId(category);
                if (value[0] > max) {
                    value = [max];
                }
                this.getThingCallback(value[0], category);
                this.sendThingList(value, category);
            }
        }
    }
    setSelectedSpriteIds(value) {
        if (value && value.length > 0) {
            if (value.length > 1) {
                value.sort((a, b) => b - a); // DESCENDING
            }
            if (this._sprites && value[0] > this._sprites.spritesCount) {
                value = [this._sprites.spritesCount];
            }
            this.sendSpriteList(value);
        }
    }
    sendCommand(command) {
        this._communicator.sendCommand(command);
    }
    //--------------------------------------
    // Registration
    //--------------------------------------
    register() {
        // Register classes
        this._communicator.registerClass(ByteArray_1.ByteArray);
        this._communicator.registerClass(ClientInfo_1.ClientInfo);
        this._communicator.registerClass(FrameDuration_1.FrameDuration);
        this._communicator.registerClass(FrameGroup_1.FrameGroup);
        this._communicator.registerClass(ObjectBuilderSettings_1.ObjectBuilderSettings);
        this._communicator.registerClass(PathHelper_1.PathHelper);
        this._communicator.registerClass(SpriteData_1.SpriteData);
        this._communicator.registerClass(ThingData_1.ThingData);
        this._communicator.registerClass(ThingListItem_1.ThingListItem);
        this._communicator.registerClass(ThingProperty_1.ThingProperty);
        this._communicator.registerClass(ThingType_1.ThingType);
        this._communicator.registerClass(Version_1.Version);
        // Register callbacks
        this._communicator.registerCallback(SettingsCommand_1.SettingsCommand, this.settingsCallback.bind(this));
        this._communicator.registerCallback(LoadVersionsCommand_1.LoadVersionsCommand, this.loadClientVersionsCallback.bind(this));
        this._communicator.registerCallback(LoadSpriteDimensionsCommand_1.LoadSpriteDimensionsCommand, this.loadSpriteDimensionsCallback.bind(this));
        this._communicator.registerCallback(SetSpriteDimensionCommand_1.SetSpriteDimensionCommand, this.setSpriteDimensionCallback.bind(this));
        // File commands
        this._communicator.registerCallback(CreateNewFilesCommand_1.CreateNewFilesCommand, this.createNewFilesCallback.bind(this));
        this._communicator.registerCallback(LoadFilesCommand_1.LoadFilesCommand, this.loadFilesCallback.bind(this));
        this._communicator.registerCallback(MergeFilesCommand_1.MergeFilesCommand, this.mergeFilesCallback.bind(this));
        this._communicator.registerCallback(CompileCommand_1.CompileCommand, this.compileCallback.bind(this));
        this._communicator.registerCallback(CompileAsCommand_1.CompileAsCommand, this.compileAsCallback.bind(this));
        this._communicator.registerCallback(UnloadFilesCommand_1.UnloadFilesCommand, this.unloadFilesCallback.bind(this));
        // Thing commands
        this._communicator.registerCallback(NewThingCommand_1.NewThingCommand, this.newThingCallback.bind(this));
        this._communicator.registerCallback(UpdateThingCommand_1.UpdateThingCommand, this.updateThingCallback.bind(this));
        this._communicator.registerCallback(ImportThingsCommand_1.ImportThingsCommand, this.importThingsCallback.bind(this));
        this._communicator.registerCallback(ImportThingsFromFilesCommand_1.ImportThingsFromFilesCommand, this.importThingsFromFilesCallback.bind(this));
        this._communicator.registerCallback(ExportThingCommand_1.ExportThingCommand, this.exportThingCallback.bind(this));
        this._communicator.registerCallback(ReplaceThingsCommand_1.ReplaceThingsCommand, this.replaceThingsCallback.bind(this));
        this._communicator.registerCallback(ReplaceThingsFromFilesCommand_1.ReplaceThingsFromFilesCommand, this.replaceThingsFromFilesCallback.bind(this));
        this._communicator.registerCallback(DuplicateThingCommand_1.DuplicateThingCommand, this.duplicateThingCallback.bind(this));
        this._communicator.registerCallback(RemoveThingCommand_1.RemoveThingCommand, this.removeThingsCallback.bind(this));
        this._communicator.registerCallback(GetThingCommand_1.GetThingCommand, this.getThingCallback.bind(this));
        this._communicator.registerCallback(GetThingListCommand_1.GetThingListCommand, this.getThingListCallback.bind(this));
        this._communicator.registerCallback(FindThingCommand_1.FindThingCommand, this.findThingCallback.bind(this));
        this._communicator.registerCallback(OptimizeFrameDurationsCommand_1.OptimizeFrameDurationsCommand, this.optimizeFrameDurationsCallback.bind(this));
        this._communicator.registerCallback(ConvertFrameGroupsCommand_1.ConvertFrameGroupsCommand, this.convertFrameGroupsCallback.bind(this));
        // Sprite commands
        this._communicator.registerCallback(NewSpriteCommand_1.NewSpriteCommand, this.newSpriteCallback.bind(this));
        this._communicator.registerCallback(ImportSpritesCommand_1.ImportSpritesCommand, this.addSpritesCallback.bind(this));
        this._communicator.registerCallback(ImportSpritesFromFileCommand_1.ImportSpritesFromFileCommand, this.importSpritesFromFilesCallback.bind(this));
        this._communicator.registerCallback(ExportSpritesCommand_1.ExportSpritesCommand, this.exportSpritesCallback.bind(this));
        this._communicator.registerCallback(ReplaceSpritesCommand_1.ReplaceSpritesCommand, this.replaceSpritesCallback.bind(this));
        this._communicator.registerCallback(ReplaceSpritesFromFilesCommand_1.ReplaceSpritesFromFilesCommand, this.replaceSpritesFromFilesCallback.bind(this));
        this._communicator.registerCallback(RemoveSpritesCommand_1.RemoveSpritesCommand, this.removeSpritesCallback.bind(this));
        this._communicator.registerCallback(GetSpriteListCommand_1.GetSpriteListCommand, this.getSpriteListCallback.bind(this));
        this._communicator.registerCallback(FindSpritesCommand_1.FindSpritesCommand, this.findSpritesCallback.bind(this));
        this._communicator.registerCallback(OptimizeSpritesCommand_1.OptimizeSpritesCommand, this.optimizeSpritesCommand.bind(this));
        // General commands
        this._communicator.registerCallback(NeedToReloadCommand_1.NeedToReloadCommand, this.needToReloadCallback.bind(this));
        this._communicator.start();
    }
    //--------------------------------------
    // Callback Methods (Placeholder implementations)
    //--------------------------------------
    loadClientVersionsCallback(filePath) {
        if (!filePath) {
            throw new Error("path cannot be null or empty");
        }
        VersionStorage_1.VersionStorage.getInstance().load(filePath);
    }
    loadSpriteDimensionsCallback(filePath) {
        if (!filePath) {
            throw new Error("path cannot be null or empty");
        }
        SpriteDimensionStorage_1.SpriteDimensionStorage.getInstance().load(filePath);
    }
    setSpriteDimensionCallback(value, size, dataSize) {
        if (!value) {
            throw new Error("value cannot be null or empty");
        }
        SpriteExtent_1.SpriteExtent.DEFAULT_VALUE = value;
        SpriteExtent_1.SpriteExtent.DEFAULT_SIZE = size;
        SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE = dataSize;
    }
    settingsCallback(settings) {
        if (!settings) {
            throw new Error("settings cannot be null or empty");
        }
        Resources_1.Resources.locale = settings.getLanguage()[0];
        this._thingListAmount = settings.objectsListAmount;
        this._spriteListAmount = settings.spritesListAmount;
        this._settings = settings;
    }
    createNewFilesCallback(datSignature, sprSignature, extended, transparency, improvedAnimations, frameGroups) {
        this.unloadFilesCallback();
        const version = VersionStorage_1.VersionStorage.getInstance().getBySignatures(datSignature, sprSignature);
        if (!version) {
            throw new Error(`No version found with signatures dat=${datSignature}, spr=${sprSignature}`);
        }
        this._version = version;
        if (!this._version) {
            throw new Error("Failed to get version");
        }
        this._extended = (extended || this._version.value >= 960);
        this._transparency = transparency;
        this._improvedAnimations = (improvedAnimations || this._version.value >= 1050);
        this._frameGroups = (frameGroups || this._version.value >= 1057);
        this.createStorage();
        // Create things
        if (this._version) {
            this._things.createNew(this._version, this._extended, this._improvedAnimations, this._frameGroups);
            // Create sprites
            this._sprites.createNew(this._version, this._extended, this._transparency);
        }
        // Update preview
        const thing = this._things.getItemType(ThingTypeStorage_1.ThingTypeStorage.MIN_ITEM_ID);
        if (thing) {
            this.getThingCallback(thing.id, thing.category);
        }
        // Send sprites
        this.sendSpriteList([1]);
    }
    loadFilesCallback(datFile, sprFile, version, extended, transparency, improvedAnimations, frameGroups) {
        if (!datFile) {
            throw new Error("datFile cannot be null or empty");
        }
        if (!sprFile) {
            throw new Error("sprFile cannot be null or empty");
        }
        if (!version) {
            throw new Error("version cannot be null");
        }
        this.unloadFilesCallback();
        this._datFile = datFile;
        this._sprFile = sprFile;
        this._version = version;
        this._extended = (extended || this._version.value >= 960);
        this._transparency = transparency;
        this._improvedAnimations = (improvedAnimations || this._version.value >= 1050);
        this._frameGroups = (frameGroups || this._version.value >= 1057);
        this.createStorage();
        this._things.load(this._datFile, this._version, this._extended, this._improvedAnimations, this._frameGroups);
        this._sprites.load(this._sprFile, this._version, this._extended, this._transparency);
    }
    mergeFilesCallback(datFile, sprFile, version, extended, transparency, improvedAnimations, frameGroups) {
        if (!datFile) {
            throw new Error("datFile cannot be null or empty");
        }
        if (!sprFile) {
            throw new Error("sprFile cannot be null or empty");
        }
        if (!version) {
            throw new Error("version cannot be null");
        }
        if (!this._settings) {
            throw new Error("Settings must be set before merging files");
        }
        const extendedFlag = (extended || version.value >= 960);
        const improvedAnimationsFlag = (improvedAnimations || version.value >= 1050);
        const frameGroupsFlag = (frameGroups || version.value >= 1057);
        const merger = new ClientMerger_1.ClientMerger(this._things, this._sprites, this._settings);
        merger.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(ProgressBarID_1.ProgressBarID.DEFAULT, event.loaded, event.total, event.label || ""));
        });
        merger.on("complete", () => {
            let category = null;
            let id = 0;
            if (merger.itemsCount !== 0) {
                category = ThingCategory_1.ThingCategory.ITEM;
            }
            else if (merger.outfitsCount !== 0) {
                category = ThingCategory_1.ThingCategory.OUTFIT;
            }
            else if (merger.effectsCount !== 0) {
                category = ThingCategory_1.ThingCategory.EFFECT;
            }
            else if (merger.missilesCount !== 0) {
                category = ThingCategory_1.ThingCategory.MISSILE;
            }
            if (category || merger.spritesCount !== 0) {
                this.sendClientInfo();
                if (merger.spritesCount !== 0) {
                    id = this._sprites.spritesCount;
                    this.sendSpriteList([id]);
                }
                if (category) {
                    id = this._things.getMaxId(category);
                    this.setSelectedThingIds([id], category);
                }
            }
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
        });
        merger.start(datFile, sprFile, version, extendedFlag, improvedAnimationsFlag, frameGroupsFlag, transparency);
    }
    compileAsCallback(datFile, sprFile, version, extended, transparency, improvedAnimations, frameGroups) {
        if (!datFile) {
            throw new Error("datFile cannot be null or empty");
        }
        if (!sprFile) {
            throw new Error("sprFile cannot be null or empty");
        }
        if (!version) {
            throw new Error("version cannot be null");
        }
        if (!this._things || !this._things.loaded) {
            throw new Error(Resources_1.Resources.getString("metadataNotLoaded"));
        }
        if (!this._sprites || !this._sprites.loaded) {
            throw new Error(Resources_1.Resources.getString("spritesNotLoaded"));
        }
        const structureChanged = (this._extended !== extended ||
            this._transparency !== transparency ||
            this._improvedAnimations !== improvedAnimations ||
            this._frameGroups !== frameGroups);
        if (!this._things.compile(datFile, version, extended, improvedAnimations, frameGroups) ||
            !this._sprites.compile(sprFile, version, extended, transparency)) {
            return;
        }
        // Save .otfi file
        const dir = path.dirname(datFile);
        const datName = path.basename(datFile, path.extname(datFile));
        const otfiFile = path.join(dir, datName + ".otfi");
        const otfi = new OTFI_1.OTFI(extended, transparency, improvedAnimations, frameGroups, path.basename(datFile), path.basename(sprFile), SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE);
        otfi.save(otfiFile);
        this.clientCompileComplete();
        if (!this._datFile || !this._sprFile) {
            this._datFile = datFile;
            this._sprFile = sprFile;
        }
        if (structureChanged) {
            this.sendCommand(new NeedToReloadCommand_1.NeedToReloadCommand(extended, transparency, improvedAnimations, frameGroups));
        }
        else {
            this.sendClientInfo();
        }
    }
    unloadFilesCallback() {
        if (this._things) {
            this._things.removeAllListeners(StorageEvent_1.StorageEvent.LOAD);
            this._things.removeAllListeners(StorageEvent_1.StorageEvent.CHANGE);
            this._things.removeAllListeners(ProgressEvent_1.ProgressEvent.PROGRESS);
            this._things.removeAllListeners("error");
            this._things.unload();
            this._things = null;
        }
        if (this._sprites) {
            this._sprites.removeAllListeners(StorageEvent_1.StorageEvent.LOAD);
            this._sprites.removeAllListeners(StorageEvent_1.StorageEvent.CHANGE);
            this._sprites.removeAllListeners(ProgressEvent_1.ProgressEvent.PROGRESS);
            this._sprites.removeAllListeners("error");
            this._sprites.unload();
            this._sprites = null;
        }
        this._datFile = null;
        this._sprFile = null;
        this._version = null;
        this._extended = false;
        this._transparency = false;
        this._improvedAnimations = false;
        this._frameGroups = false;
        this._errorMessage = null;
    }
    newThingCallback(category) {
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        if (!this._settings || !this._things) {
            throw new Error("Settings and things storage must be initialized");
        }
        // Add thing
        const thing = ThingType_1.ThingType.create(0, category, this._frameGroups, this._settings.getDefaultDuration(category));
        const result = this._things.addThing(thing, category);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        // Send changes
        this.getThingCallback(thing.id, category);
    }
    updateThingCallback(thingData, replaceSprites) {
        if (!thingData) {
            throw new Error("thingData cannot be null");
        }
        if (!this._things || !this._sprites) {
            throw new Error("Things and sprites storage must be initialized");
        }
        const thing = thingData.thing;
        if (!thing) {
            throw new Error("thingData.thing cannot be null");
        }
        if (!this._things.hasThingType(thing.category, thing.id)) {
            throw new Error(Resources_1.Resources.getString("thingNotFound", Resources_1.Resources.getString(thing.category), thing.id));
        }
        // Update sprites
        const spritesIds = [];
        const currentThing = this._things.getThingType(thing.id, thing.category);
        if (!currentThing) {
            return;
        }
        const sprites = thingData.sprites;
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const frameGroup = thing.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }
            const currentFrameGroup = currentThing.getFrameGroup(groupType);
            if (!currentFrameGroup) {
                continue;
            }
            const groupSprites = sprites.get(groupType);
            if (!groupSprites) {
                continue;
            }
            const length = groupSprites.length;
            if (!frameGroup.spriteIndex) {
                continue;
            }
            for (let i = 0; i < length; i++) {
                const spriteData = groupSprites[i];
                let id = frameGroup.spriteIndex[i];
                if (id === 0xFFFFFFFF) { // uint.MAX_VALUE
                    if (spriteData.isEmpty()) {
                        frameGroup.spriteIndex[i] = 0;
                    }
                    else {
                        let result;
                        if (replaceSprites && currentFrameGroup.spriteIndex && i < currentFrameGroup.spriteIndex.length && currentFrameGroup.spriteIndex[i] !== 0) {
                            if (!spriteData.pixels) {
                                continue;
                            }
                            result = this._sprites.replaceSprite(currentFrameGroup.spriteIndex[i], spriteData.pixels);
                        }
                        else {
                            if (!spriteData.pixels) {
                                continue;
                            }
                            result = this._sprites.addSprite(spriteData.pixels);
                        }
                        if (!result.done) {
                            console.error(result.message);
                            return;
                        }
                        if (result.list && result.list.length > 0) {
                            const newSpriteData = result.list[0];
                            frameGroup.spriteIndex[i] = newSpriteData.id;
                            spritesIds.push(newSpriteData.id);
                        }
                    }
                }
                else {
                    if (!this._sprites.hasSpriteId(id)) {
                        console.error(Resources_1.Resources.getString("spriteNotFound", id));
                        return;
                    }
                }
            }
        }
        // Update thing
        const result = this._things.replaceThing(thing, thing.category, thing.id);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        // Send changes
        if (spritesIds.length > 0) {
            this.setSelectedSpriteIds(spritesIds);
        }
        this.getThingCallback(thingData.id, thingData.category);
        this.sendThingList([thingData.id], thingData.category);
    }
    importThingsCallback(list) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!this._things || !this._sprites || !this._version || !this._settings) {
            throw new Error("Storage, version, and settings must be initialized");
        }
        const length = list.length;
        if (length === 0)
            return;
        // Add sprites
        const spritesIds = [];
        for (let i = 0; i < length; i++) {
            const thingData = list[i];
            if (this._frameGroups && thingData.obdVersion < OBDVersions_1.OBDVersions.OBD_VERSION_3) {
                ThingUtils_1.ThingUtils.convertFrameGroups(thingData, ThingUtils_1.ThingUtils.ADD_FRAME_GROUPS, this._improvedAnimations, this._settings.getDefaultDuration(thingData.category), this._version.value < 870);
            }
            else if (!this._frameGroups && thingData.obdVersion >= OBDVersions_1.OBDVersions.OBD_VERSION_3) {
                ThingUtils_1.ThingUtils.convertFrameGroups(thingData, ThingUtils_1.ThingUtils.REMOVE_FRAME_GROUPS, this._improvedAnimations, this._settings.getDefaultDuration(thingData.category), this._version.value < 870);
            }
            const thing = thingData.thing;
            if (!thing) {
                continue;
            }
            for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
                const frameGroup = thing.getFrameGroup(groupType);
                if (!frameGroup) {
                    continue;
                }
                const groupSprites = thingData.sprites.get(groupType);
                if (!groupSprites) {
                    continue;
                }
                const len = groupSprites.length;
                for (let k = 0; k < len; k++) {
                    const spriteData = groupSprites[k];
                    let id = spriteData.id;
                    if (spriteData.isEmpty()) {
                        id = 0;
                    }
                    else if (spriteData.pixels && (!this._sprites.hasSpriteId(id) || !this._sprites.compare(id, spriteData.pixels))) {
                        const result = this._sprites.addSprite(spriteData.pixels);
                        if (!result.done) {
                            console.error(result.message);
                            return;
                        }
                        id = this._sprites.spritesCount;
                        spritesIds.push(id);
                    }
                    if (frameGroup.spriteIndex) {
                        frameGroup.spriteIndex[k] = id;
                    }
                }
            }
        }
        // Add things
        const thingsToAdd = [];
        for (let i = 0; i < length; i++) {
            const thing = list[i].thing;
            if (thing) {
                thingsToAdd.push(thing);
            }
        }
        if (thingsToAdd.length === 0) {
            return;
        }
        const result = this._things.addThings(thingsToAdd);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        const addedThings = result.list;
        if (!addedThings) {
            return;
        }
        const thingsIds = [];
        for (let i = 0; i < addedThings.length; i++) {
            thingsIds.push(addedThings[i].id);
        }
        if (spritesIds.length > 0) {
            this.sendSpriteList([this._sprites.spritesCount]);
        }
        if (list.length === 0 || !list[0].thing) {
            return;
        }
        const category = list[0].thing.category;
        this.setSelectedThingIds(thingsIds, category);
    }
    importThingsFromFilesCallback(list) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!this._settings) {
            throw new Error("Settings must be initialized");
        }
        const length = list.length;
        if (length === 0)
            return;
        const loader = new ThingDataLoader_1.ThingDataLoader(this._settings);
        loader.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(event.id, event.loaded, event.total, Resources_1.Resources.getString("loading")));
        });
        loader.on("complete", () => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
            this.importThingsCallback(loader.thingDataList);
        });
        loader.on("error", (error) => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
            console.error(error);
        });
        loader.loadFiles(list);
    }
    async exportThingCallback(list, category, obdVersion, clientVersion, spriteSheetFlag, transparentBackground, jpegQuality) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        if (!clientVersion) {
            throw new Error("clientVersion cannot be null");
        }
        if (!this._settings) {
            throw new Error("Settings must be initialized");
        }
        const length = list.length;
        if (length === 0)
            return;
        // Export things
        const label = Resources_1.Resources.getString("exportingObjects");
        const encoder = new OBDEncoder_1.OBDEncoder(this._settings);
        const helper = new SaveHelper_1.SaveHelper();
        const backgroundColor = (this._transparency || transparentBackground) ? 0x00FF00FF : 0xFFFF00FF;
        for (let i = 0; i < length; i++) {
            const pathHelper = list[i];
            const thingData = this.getThingData(pathHelper.id, category, obdVersion, clientVersion.value);
            const filePath = pathHelper.nativePath;
            const name = path.basename(filePath, path.extname(filePath));
            const format = path.extname(filePath).substring(1).toLowerCase();
            if (!thingData) {
                continue;
            }
            if (ImageCodec_1.ImageCodec.hasImageFormat(format)) {
                const bitmap = thingData.getTotalSpriteSheet(null, backgroundColor);
                const bytes = await ImageCodec_1.ImageCodec.encode(bitmap, format, jpegQuality);
                helper.addFile(bytes, name, format, filePath);
                if (spriteSheetFlag !== 0 && thingData.thing) {
                    const patternsString = ObUtils_1.ObUtils.getPatternsString(thingData.thing, spriteSheetFlag);
                    const txtPath = filePath.replace(new RegExp(`\\.${format}$`, "i"), ".txt");
                    helper.addFile(patternsString, name, "txt", txtPath);
                }
            }
            else if (format === OTFormat_1.OTFormat.OBD) {
                if (thingData) {
                    const bytes = await encoder.encode(thingData);
                    helper.addFile(bytes.toBuffer(), name, format, filePath);
                }
            }
        }
        helper.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(ProgressBarID_1.ProgressBarID.DEFAULT, event.loaded, event.total, label));
        });
        helper.on("complete", () => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
        });
        helper.on("error", (error) => {
            console.error(error);
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
        });
        await helper.save();
    }
    replaceThingsCallback(list) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!this._things || !this._sprites || !this._version || !this._settings) {
            throw new Error("Storage, version, and settings must be initialized");
        }
        const length = list.length;
        if (length === 0)
            return;
        // Add sprites
        const spritesIds = [];
        for (let i = 0; i < length; i++) {
            const thingData = list[i];
            if (this._frameGroups && thingData.obdVersion < OBDVersions_1.OBDVersions.OBD_VERSION_3) {
                ThingUtils_1.ThingUtils.convertFrameGroups(thingData, ThingUtils_1.ThingUtils.ADD_FRAME_GROUPS, this._improvedAnimations, this._settings.getDefaultDuration(thingData.category), this._version.value < 870);
            }
            else if (!this._frameGroups && thingData.obdVersion >= OBDVersions_1.OBDVersions.OBD_VERSION_3) {
                ThingUtils_1.ThingUtils.convertFrameGroups(thingData, ThingUtils_1.ThingUtils.REMOVE_FRAME_GROUPS, this._improvedAnimations, this._settings.getDefaultDuration(thingData.category), this._version.value < 870);
            }
            const thing = thingData.thing;
            if (!thing) {
                continue;
            }
            for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
                const frameGroup = thing.getFrameGroup(groupType);
                if (!frameGroup) {
                    continue;
                }
                const groupSprites = thingData.sprites.get(groupType);
                if (!groupSprites) {
                    continue;
                }
                const len = groupSprites.length;
                for (let k = 0; k < len; k++) {
                    const spriteData = groupSprites[k];
                    let id = spriteData.id;
                    if (spriteData.isEmpty()) {
                        id = 0;
                    }
                    else if (spriteData.pixels && (!this._sprites.hasSpriteId(id) || !this._sprites.compare(id, spriteData.pixels))) {
                        const result = this._sprites.addSprite(spriteData.pixels);
                        if (!result.done) {
                            console.error(result.message);
                            return;
                        }
                        id = this._sprites.spritesCount;
                        spritesIds.push(id);
                    }
                    if (frameGroup.spriteIndex) {
                        frameGroup.spriteIndex[k] = id;
                    }
                }
            }
        }
        // Replace things
        const thingsToReplace = [];
        const thingsIds = [];
        for (let i = 0; i < length; i++) {
            const thing = list[i].thing;
            if (thing) {
                thingsToReplace.push(thing);
                thingsIds.push(list[i].id);
            }
        }
        if (thingsToReplace.length === 0) {
            return;
        }
        const result = this._things.replaceThings(thingsToReplace);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        // Send changes
        if (spritesIds.length > 0) {
            this.sendSpriteList([this._sprites.spritesCount]);
        }
        if (list.length === 0 || !list[0].thing) {
            return;
        }
        const category = list[0].thing.category;
        this.setSelectedThingIds(thingsIds, category);
    }
    replaceThingsFromFilesCallback(list) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!this._settings) {
            throw new Error("Settings must be initialized");
        }
        const length = list.length;
        if (length === 0)
            return;
        const loader = new ThingDataLoader_1.ThingDataLoader(this._settings);
        loader.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(event.id, event.loaded, event.total, Resources_1.Resources.getString("loading")));
        });
        loader.on("complete", () => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
            this.replaceThingsCallback(loader.thingDataList);
        });
        loader.on("error", (error) => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
            console.error(error);
        });
        loader.loadFiles(list);
    }
    duplicateThingCallback(ids, category) {
        if (!ids) {
            throw new Error("ids cannot be null");
        }
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        if (!this._things) {
            throw new Error("Things storage must be initialized");
        }
        const length = ids.length;
        if (length === 0)
            return;
        // Duplicate things
        ids.sort((a, b) => a - b); // NUMERIC
        const thingsCopyList = [];
        for (let i = 0; i < length; i++) {
            const thing = this._things.getThingType(ids[i], category);
            if (!thing) {
                throw new Error(Resources_1.Resources.getString("thingNotFound", Resources_1.Resources.getString(category), ids[i]));
            }
            thingsCopyList.push(thing.clone());
        }
        const result = this._things.addThings(thingsCopyList);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        const addedThings = result.list;
        if (!addedThings) {
            return;
        }
        const thingIds = [];
        for (let i = 0; i < addedThings.length; i++) {
            thingIds.push(addedThings[i].id);
        }
        this.setSelectedThingIds(thingIds, category);
    }
    removeThingsCallback(list, category, removeSprites) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        if (!this._things || !this._sprites) {
            throw new Error("Things and sprites storage must be initialized");
        }
        const length = list.length;
        if (length === 0)
            return;
        // Remove things
        const result = this._things.removeThings(list, category);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        const removedThingList = result.list;
        if (!removedThingList) {
            return;
        }
        // Remove sprites
        let removedSpriteList = [];
        let spriteIds = [];
        if (removeSprites) {
            const sprites = new Set();
            for (let i = 0; i < removedThingList.length; i++) {
                const thing = removedThingList[i];
                for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
                    const frameGroup = thing.getFrameGroup(groupType);
                    if (!frameGroup || !frameGroup.spriteIndex) {
                        continue;
                    }
                    const spriteIndex = frameGroup.spriteIndex;
                    const len = spriteIndex.length;
                    for (let k = 0; k < len; k++) {
                        const id = spriteIndex[k];
                        if (id !== 0) {
                            sprites.add(id);
                        }
                    }
                }
            }
            spriteIds = Array.from(sprites);
            if (spriteIds.length > 0) {
                const spriteResult = this._sprites.removeSprites(spriteIds);
                if (!spriteResult.done) {
                    console.error(spriteResult.message);
                    return;
                }
                removedSpriteList = spriteResult.list || [];
            }
        }
        // Send changes
        const thingIds = [];
        for (let i = 0; i < removedThingList.length; i++) {
            thingIds.push(removedThingList[i].id);
        }
        this.setSelectedThingIds(thingIds, category);
        // Sprites changes
        if (removeSprites && spriteIds.length !== 0) {
            spriteIds.sort((a, b) => a - b);
            this.sendSpriteList([spriteIds[0]]);
        }
    }
    getThingCallback(id, category) {
        this.sendThingData(id, category);
    }
    getThingListCallback(targetId, category) {
        if (!category) {
            throw new Error("category cannot be null or empty");
        }
        this.sendThingList([targetId], category);
    }
    findThingCallback(category, properties) {
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        if (!properties) {
            throw new Error("properties cannot be null");
        }
        if (!this._things) {
            throw new Error("Things storage must be initialized");
        }
        const list = [];
        const things = this._things.findThingTypeByProperties(category, properties);
        const length = things.length;
        for (let i = 0; i < length; i++) {
            const listItem = new ThingListItem_1.ThingListItem();
            listItem.thing = things[i];
            listItem.frameGroup = things[i].getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
            listItem.pixels = this.getBitmapPixels(things[i]); // Returns ByteArray
            list.push(listItem);
        }
        this.sendCommand(new FindResultCommand_1.FindResultCommand(FindResultCommand_1.FindResultCommand.THINGS, list));
    }
    optimizeFrameDurationsCallback(items, itemsMinimumDuration, itemsMaximumDuration, outfits, outfitsMinimumDuration, outfitsMaximumDuration, effects, effectsMinimumDuration, effectsMaximumDuration) {
        if (!this._things) {
            throw new Error("Things storage must be initialized");
        }
        const optimizer = new FrameDurationsOptimizer_1.FrameDurationsOptimizer(this._things, items, itemsMinimumDuration, itemsMaximumDuration, outfits, outfitsMinimumDuration, outfitsMaximumDuration, effects, effectsMinimumDuration, effectsMaximumDuration);
        optimizer.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(ProgressBarID_1.ProgressBarID.OPTIMIZE, event.loaded, event.total, event.label || ""));
        });
        optimizer.on("complete", () => {
            this.sendCommand(new OptimizeFrameDurationsResultCommand_1.OptimizeFrameDurationsResultCommand());
        });
        optimizer.start();
    }
    convertFrameGroupsCallback(frameGroups, mounts) {
        if (!this._things || !this._sprites || !this._version || !this._settings) {
            throw new Error("Storage, version, and settings must be initialized");
        }
        const optimizer = new FrameGroupsConverter_1.FrameGroupsConverter(this._things, this._sprites, frameGroups, mounts, this._version.value, this._improvedAnimations, this._settings.getDefaultDuration(ThingCategory_1.ThingCategory.OUTFIT));
        optimizer.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(ProgressBarID_1.ProgressBarID.OPTIMIZE, event.loaded, event.total, event.label || ""));
        });
        optimizer.on("complete", () => {
            this._frameGroups = frameGroups;
            this.sendCommand(new ConvertFrameGroupsResultCommand_1.ConvertFrameGroupsResultCommand());
        });
        optimizer.start();
    }
    newSpriteCallback() {
        if (!this._sprites) {
            throw new Error("Sprites storage must be initialized");
        }
        if (this._sprites.isFull) {
            console.error(Resources_1.Resources.getString("spritesLimitReached"));
            return;
        }
        // Add sprite
        const rect = { x: 0, y: 0, width: SpriteExtent_1.SpriteExtent.DEFAULT_SIZE, height: SpriteExtent_1.SpriteExtent.DEFAULT_SIZE };
        const bitmap = new BitmapData_1.BitmapData(rect.width, rect.height, true, 0);
        const pixels = bitmap.getPixels(rect);
        const result = this._sprites.addSprite(pixels);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        // Send changes
        this.sendSpriteList([this._sprites.spritesCount]);
    }
    addSpritesCallback(sprites) {
        if (!sprites) {
            throw new Error("sprites cannot be null");
        }
        if (!this._sprites) {
            throw new Error("Sprites storage must be initialized");
        }
        if (sprites.length === 0)
            return;
        // Add sprites
        const result = this._sprites.addSprites(sprites);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        const spriteAddedList = result.list;
        if (!spriteAddedList) {
            return;
        }
        // Send changes to application
        const ids = [];
        const length = spriteAddedList.length;
        for (let i = 0; i < length; i++) {
            ids.push(spriteAddedList[i].id);
        }
        this.sendSpriteList([ids[0]]);
    }
    importSpritesFromFilesCallback(list) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (list.length === 0)
            return;
        const loader = new SpriteDataLoader_1.SpriteDataLoader();
        loader.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(event.id, event.loaded, event.total, Resources_1.Resources.getString("loading")));
        });
        loader.on("complete", () => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
            const spriteDataList = loader.spriteDataList;
            const length = spriteDataList.length;
            const sprites = [];
            // Sort by id descending
            spriteDataList.sort((a, b) => b.id - a.id);
            for (let i = 0; i < length; i++) {
                const pixels = spriteDataList[i].pixels;
                if (pixels) {
                    sprites.push(pixels);
                }
            }
            this.addSpritesCallback(sprites);
        });
        loader.on("error", (error) => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
            console.error(error);
        });
        loader.loadFiles(list);
    }
    async exportSpritesCallback(list, transparentBackground, jpegQuality) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!this._sprites) {
            throw new Error("Sprites storage must be initialized");
        }
        const length = list.length;
        if (length === 0)
            return;
        // Save sprites
        const label = Resources_1.Resources.getString("exportingSprites");
        const helper = new SaveHelper_1.SaveHelper();
        for (let i = 0; i < length; i++) {
            const pathHelper = list[i];
            const filePath = pathHelper.nativePath;
            const name = path.basename(filePath, path.extname(filePath));
            const format = path.extname(filePath).substring(1).toLowerCase();
            if (ImageCodec_1.ImageCodec.hasImageFormat(format) && pathHelper.id !== 0) {
                const bitmap = this._sprites.getBitmap(pathHelper.id, transparentBackground);
                if (bitmap) {
                    const bytes = await ImageCodec_1.ImageCodec.encode(bitmap, format, jpegQuality);
                    helper.addFile(bytes, name, format, filePath);
                }
            }
        }
        helper.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(ProgressBarID_1.ProgressBarID.DEFAULT, event.loaded, event.total, label));
        });
        helper.on("complete", () => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
        });
        helper.on("error", (error) => {
            console.error(error);
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
        });
        await helper.save();
    }
    replaceSpritesCallback(list) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!this._sprites) {
            throw new Error("Sprites storage must be initialized");
        }
        const length = list.length;
        if (length === 0)
            return;
        // Replace sprites
        const result = this._sprites.replaceSprites(list);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        // Send changes
        const spriteIds = [];
        for (let i = 0; i < length; i++) {
            spriteIds.push(list[i].id);
        }
        this.setSelectedSpriteIds(spriteIds);
    }
    replaceSpritesFromFilesCallback(files) {
        if (!files) {
            throw new Error("files cannot be null");
        }
        if (files.length === 0)
            return;
        const loader = new SpriteDataLoader_1.SpriteDataLoader();
        loader.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(event.id, event.loaded, event.total, Resources_1.Resources.getString("loading")));
        });
        loader.on("complete", () => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
            this.replaceSpritesCallback(loader.spriteDataList);
        });
        loader.on("error", (error) => {
            this.sendCommand(new HideProgressBarCommand_1.HideProgressBarCommand(ProgressBarID_1.ProgressBarID.DEFAULT));
            console.error(error);
        });
        loader.loadFiles(files);
    }
    removeSpritesCallback(list) {
        if (!list) {
            throw new Error("list cannot be null");
        }
        if (!this._sprites) {
            throw new Error("Sprites storage must be initialized");
        }
        // Remove sprites
        const result = this._sprites.removeSprites(list);
        if (!result.done) {
            console.error(result.message);
            return;
        }
        // Send changes
        this.setSelectedSpriteIds(list);
    }
    getSpriteListCallback(targetId) {
        this.sendSpriteList([targetId]);
    }
    findSpritesCallback(unusedSprites, emptySprites) {
        if (!this._things || !this._sprites) {
            throw new Error("Things and sprites storage must be initialized");
        }
        const finder = new SpritesFinder_1.SpritesFinder(this._things, this._sprites);
        finder.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(ProgressBarID_1.ProgressBarID.FIND, event.loaded, event.total));
        });
        finder.on("complete", () => {
            this.sendCommand(new FindResultCommand_1.FindResultCommand(FindResultCommand_1.FindResultCommand.SPRITES, finder.foundList));
        });
        finder.start(unusedSprites, emptySprites);
    }
    optimizeSpritesCommand() {
        if (!this._things || !this._sprites) {
            throw new Error("Things and sprites storage must be initialized");
        }
        const optimizer = new SpritesOptimizer_1.SpritesOptimizer(this._things, this._sprites);
        optimizer.on("progress", (event) => {
            this.sendCommand(new ProgressCommand_1.ProgressCommand(ProgressBarID_1.ProgressBarID.OPTIMIZE, event.loaded, event.total, event.label || ""));
        });
        optimizer.on("complete", () => {
            if (optimizer.removedCount > 0) {
                this.sendClientInfo();
                this.sendSpriteList([0]);
                this.sendThingList([ThingTypeStorage_1.ThingTypeStorage.MIN_ITEM_ID], ThingCategory_1.ThingCategory.ITEM);
            }
            this.sendCommand(new OptimizeSpritesResultCommand_1.OptimizeSpritesResultCommand(optimizer.removedCount, optimizer.oldCount, optimizer.newCount));
        });
        optimizer.start();
    }
    needToReloadCallback(extended, transparency, improvedAnimations, frameGroups) {
        if (this._datFile && this._sprFile && this._version) {
            this.loadFilesCallback(this._datFile, this._sprFile, this._version, extended, transparency, improvedAnimations, frameGroups);
        }
    }
    //--------------------------------------
    // Helper Methods
    //--------------------------------------
    sendThingData(id, category) {
        if (!this._version) {
            return;
        }
        const thingData = this.getThingData(id, category, OBDVersions_1.OBDVersions.OBD_VERSION_3, this._version.value);
        if (thingData) {
            this.sendCommand(new SetThingDataCommand_1.SetThingDataCommand(thingData));
        }
    }
    sendThingList(selectedIds, category) {
        if (!this._things || !this._things.loaded) {
            throw new Error(Resources_1.Resources.getString("metadataNotLoaded"));
        }
        const first = this._things.getMinId(category);
        const last = this._things.getMaxId(category);
        const length = selectedIds.length;
        if (length > 1) {
            selectedIds.sort((a, b) => b - a); // DESCENDING
            if (selectedIds[length - 1] > last) {
                selectedIds = [last];
            }
        }
        const target = length === 0 ? 0 : selectedIds[0];
        const min = Math.max(first, ObUtils_1.ObUtils.hundredFloor(target));
        const diff = (category !== ThingCategory_1.ThingCategory.ITEM && min === first) ? 1 : 0;
        const max = Math.min((min - diff) + (this._thingListAmount - 1), last);
        const list = [];
        for (let i = min; i <= max; i++) {
            const thing = this._things.getThingType(i, category);
            if (!thing) {
                throw new Error(Resources_1.Resources.getString("thingNotFound", Resources_1.Resources.getString(category), i));
            }
            const listItem = new ThingListItem_1.ThingListItem();
            listItem.thing = thing;
            listItem.frameGroup = thing.getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
            listItem.pixels = this.getBitmapPixels(thing); // Returns ByteArray
            list.push(listItem);
        }
        this.sendCommand(new SetThingListCommand_1.SetThingListCommand(selectedIds, list));
    }
    sendSpriteList(selectedIds) {
        if (!selectedIds) {
            throw new Error("selectedIds cannot be null");
        }
        if (!this._sprites || !this._sprites.loaded) {
            throw new Error(Resources_1.Resources.getString("spritesNotLoaded"));
        }
        const length = selectedIds.length;
        if (length > 1) {
            selectedIds.sort((a, b) => b - a); // DESCENDING
            if (selectedIds[length - 1] > this._sprites.spritesCount) {
                selectedIds = [this._sprites.spritesCount];
            }
        }
        const target = length === 0 ? 0 : selectedIds[0];
        const first = 0;
        const last = this._sprites.spritesCount;
        const min = Math.max(first, ObUtils_1.ObUtils.hundredFloor(target));
        const max = Math.min(min + (this._spriteListAmount - 1), last);
        const list = [];
        for (let i = min; i <= max; i++) {
            const pixels = this._sprites.getPixels(i);
            if (!pixels) {
                throw new Error(Resources_1.Resources.getString("spriteNotFound", i));
            }
            const spriteData = new SpriteData_1.SpriteData();
            spriteData.id = i;
            spriteData.pixels = pixels; // Already a Buffer
            list.push(spriteData);
        }
        this.sendCommand(new SetSpriteListCommand_1.SetSpriteListCommand(selectedIds, list));
    }
    getThingData(id, category, obdVersion, clientVersion) {
        if (!ThingCategory_1.ThingCategory.getCategory(category)) {
            throw new Error(Resources_1.Resources.getString("invalidCategory"));
        }
        if (!this._things || !this._sprites) {
            return null;
        }
        const thing = this._things.getThingType(id, category);
        if (!thing) {
            throw new Error(Resources_1.Resources.getString("thingNotFound", Resources_1.Resources.getString(category), id));
        }
        const sprites = new Map();
        for (let groupType = FrameGroupType_1.FrameGroupType.DEFAULT; groupType <= FrameGroupType_1.FrameGroupType.WALKING; groupType++) {
            const frameGroup = thing.getFrameGroup(groupType);
            if (!frameGroup) {
                continue;
            }
            sprites.set(groupType, []);
            const spriteIndex = frameGroup.spriteIndex;
            if (!spriteIndex) {
                continue;
            }
            const spriteIndexLength = spriteIndex.length;
            for (let i = 0; i < spriteIndexLength; i++) {
                const spriteId = spriteIndex[i];
                let pixels = this._sprites.getPixels(spriteId);
                if (!pixels) {
                    const alertSprite = this._sprites.alertSprite;
                    if (alertSprite) {
                        const alertPixels = alertSprite.getPixels();
                        pixels = alertPixels instanceof Buffer ? alertPixels : alertPixels.toBuffer();
                    }
                    else {
                        pixels = Buffer.alloc(SpriteExtent_1.SpriteExtent.DEFAULT_DATA_SIZE);
                    }
                }
                const spriteData = new SpriteData_1.SpriteData();
                spriteData.id = spriteId;
                spriteData.pixels = pixels;
                sprites.get(groupType).push(spriteData);
            }
        }
        return ThingData_1.ThingData.create(obdVersion, clientVersion, thing, sprites);
    }
    getBitmapPixels(thing) {
        const size = SpriteExtent_1.SpriteExtent.DEFAULT_SIZE;
        const frameGroup = thing.getFrameGroup(FrameGroupType_1.FrameGroupType.DEFAULT);
        if (!frameGroup) {
            return new ByteArray_1.ByteArray();
        }
        let width = frameGroup.width;
        let height = frameGroup.height;
        let layers = frameGroup.layers;
        const bitmap = new BitmapData_1.BitmapData(width * size, height * size, true, 0xFF636363);
        let x = 0;
        if (thing.category === ThingCategory_1.ThingCategory.OUTFIT) {
            layers = 1;
            x = frameGroup.patternX > 1 ? 2 : 0;
        }
        if (!this._sprites) {
            return new ByteArray_1.ByteArray();
        }
        for (let l = 0; l < layers; l++) {
            for (let w = 0; w < width; w++) {
                for (let h = 0; h < height; h++) {
                    const index = frameGroup.getSpriteIndex(w, h, l, x, 0, 0, 0);
                    const px = (width - w - 1) * size;
                    const py = (height - h - 1) * size;
                    if (!frameGroup.spriteIndex) {
                        continue;
                    }
                    const spriteId = frameGroup.spriteIndex[index];
                    this._sprites.copyPixels(spriteId, bitmap, px, py);
                }
            }
        }
        const pixels = bitmap.getPixels(bitmap.rect);
        return ByteArray_1.ByteArray.fromBuffer(pixels);
    }
    sendClientInfo() {
        const info = new ClientInfo_1.ClientInfo();
        info.loaded = this.clientLoaded;
        if (info.loaded && this._things && this._sprites && this._version) {
            info.clientVersion = this._version.value;
            info.clientVersionStr = this._version.valueStr;
            info.datSignature = this._things.signature;
            info.minItemId = ThingTypeStorage_1.ThingTypeStorage.MIN_ITEM_ID;
            info.maxItemId = this._things.itemsCount;
            info.minOutfitId = ThingTypeStorage_1.ThingTypeStorage.MIN_OUTFIT_ID;
            info.maxOutfitId = this._things.outfitsCount;
            info.minEffectId = ThingTypeStorage_1.ThingTypeStorage.MIN_EFFECT_ID;
            info.maxEffectId = this._things.effectsCount;
            info.minMissileId = ThingTypeStorage_1.ThingTypeStorage.MIN_MISSILE_ID;
            info.maxMissileId = this._things.missilesCount;
            info.sprSignature = this._sprites.signature;
            info.minSpriteId = 0;
            info.maxSpriteId = this._sprites.spritesCount;
            info.extended = this._extended;
            info.transparency = this._transparency;
            info.improvedAnimations = this._improvedAnimations;
            info.frameGroups = this._frameGroups;
            info.changed = this.clientChanged;
            info.isTemporary = this.clientIsTemporary;
        }
        this.sendCommand(new SetClientInfoCommand_1.SetClientInfoCommand(info));
    }
    createStorage() {
        if (!this._settings) {
            throw new Error("Settings must be set before creating storage");
        }
        this._things = new ThingTypeStorage_1.ThingTypeStorage(this._settings);
        this._things.on(StorageEvent_1.StorageEvent.LOAD, this.storageLoadHandler.bind(this));
        this._things.on(StorageEvent_1.StorageEvent.CHANGE, this.storageChangeHandler.bind(this));
        this._things.on(ProgressEvent_1.ProgressEvent.PROGRESS, this.thingsProgressHandler.bind(this));
        this._things.on("error", this.thingsErrorHandler.bind(this));
        this._sprites = new SpriteStorage_1.SpriteStorage();
        this._sprites.on(StorageEvent_1.StorageEvent.LOAD, this.storageLoadHandler.bind(this));
        this._sprites.on(StorageEvent_1.StorageEvent.CHANGE, this.storageChangeHandler.bind(this));
        this._sprites.on(ProgressEvent_1.ProgressEvent.PROGRESS, this.spritesProgressHandler.bind(this));
        this._sprites.on("error", this.spritesErrorHandler.bind(this));
    }
    clientLoadComplete() {
        this.sendClientInfo();
        this.sendThingList([ThingTypeStorage_1.ThingTypeStorage.MIN_ITEM_ID], ThingCategory_1.ThingCategory.ITEM);
        this.sendThingData(ThingTypeStorage_1.ThingTypeStorage.MIN_ITEM_ID, ThingCategory_1.ThingCategory.ITEM);
        this.sendSpriteList([0]);
    }
    clientCompileComplete() {
        this._compiled = true;
        this.sendClientInfo();
    }
    //--------------------------------------
    // Event Handlers
    //--------------------------------------
    storageLoadHandler(event) {
        if ((event.target === this._things || event.target === this._sprites) && this.clientLoaded) {
            this.clientLoadComplete();
        }
    }
    storageChangeHandler(event) {
        this.sendClientInfo();
    }
    thingsProgressHandler(event) {
        this.sendCommand(new ProgressCommand_1.ProgressCommand(event.id, event.loaded, event.total, "Metadata"));
    }
    thingsErrorHandler(error) {
        // TODO: Handle errors, potentially retry with extended mode
        console.error("Things error:", error);
    }
    spritesProgressHandler(event) {
        this.sendCommand(new ProgressCommand_1.ProgressCommand(event.id, event.loaded, event.total, "Sprites"));
    }
    spritesErrorHandler(error) {
        // TODO: Handle sprite errors
        console.error("Sprites error:", error);
    }
}
exports.ObjectBuilderWorker = ObjectBuilderWorker;
