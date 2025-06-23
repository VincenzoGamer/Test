// ^ See #guide in v4 discord ^

// Globals
global.export = {}
global.modules = []
global.settingSelection = {}

// Utils
import "./utils/JavaToJSMappings"
import "./utils/dataclasses/Vec"
import "./utils/dataclasses/ItemObject"
import "./utils/StencilUtils"
import "./utils/NumberUtils"
import "./utils/dataclasses/ServerPlayer"
import "./utils/MouseUtils"
import "./utils/dataclasses/Routes"
import "./utils/TimeHelper"
import "./utils/BlockRenderer"
import "./util/chat"
import "./utils/FileUtils"
import "./module/ModuleManager"
import "./utils/NotificationUtils"
import "./utils/GuiUtils"
import "./utils/Utils"
import "./utils/ItemUtils"
import "./utils/MathUtils"
import "./utils/MiningUtils"
import "./utils/MovementHelper"
import "./utils/RayTraceUtils"
import "./utils/WebhookManager"
import "./utils/rotation/RotationsFork"
import "./utils/rotation/PowderRotations"
import "./utils/DevUtils"
import "./utils/FlowstateUtils"
import "./utils/InventoryUtils"
import "./utils/InventoryHUD"
import "./utils/RodSwap"

// GUI
import "./gui/NotificationHandler"
import "./gui/CategoryTitle"
import "./gui/CheckboxDropdown"
import "./gui/ImageButton"
import "./gui/ModuleButton"
import "./gui/ToggleButton"
import "./gui/EditableString"
import "./gui/ThemeEditor"
import "./gui/EditLocation"
import "./gui/ProgressOverlay"
import "./gui/SelectionDropdown"
import "./gui/ValueSlider"
import "./gui/Warning"
import "./gui/GUI"

// Modules
import "./module/ModuleLoader"
import "./module/ModuleToggle"

// Pathfinding
import "./pathfinding/Pathfinder"
import "./pathfinding/RdbtPathFinder"
import "./pathfinding/PathHelper"
import "./pathfinding/RouteWalkerV2"

// Failsafes
import "./failsafe/Failsafe"
import "./failsafe/ResponseBot"
import "./failsafe/TeleportFailsafe"
import "./failsafe/RotationFailsafe"
import "./failsafe/PlayerFailsafe"
import "./failsafe/ItemFailsafe"
import "./failsafe/BlockFailsafe"
import "./failsafe/VelocityFailsafe"
import "./failsafe/SmartFailsafe"
import "./failsafe/ServerFailsafe"
import "./failsafe/FailsafeManager"

// Macros
import "./macro/MiningBot"
import "./macro/GemstoneMacro"
import "./macro/OreMacro"
import "./macro/CommissionMacro"
import "./macro/GlaciteCommission"
import "./macro/Etherwarper"
import "./qol/AutoReconnect"
import "./macro/HoppityMacro"
//import "./macro/ScathaMacro" VIP ONLY
import "./macro/ExcavatorMacro"
import "./macro/Nuker"
//import "./macro/PowderNuker"
import "./qol/AutoEnchanting"
import "./qol/AutoHarp"
import "./qol/ESP"
import "./qol/GhostBlocks"
import "./qol/LobbyHopper"
import "./qol/ProfileHider"
import "./qol/Spin"
import "./qol/FastPlace"
import "./qol/MobHider"
//import "./qol/GrottoFinder" VIP ONLY/NOT WORKING
import "./gui/clientHud"
import "./qol/AutoBeg"
//import "./qol/freecam"
import "./qol/PowderTracker"
//import "./qol/FishingXPCheese"
//import "./macro/TunnelMiner" VIP ONLY / NOT WORKING
//import "./macro/Mineshafter" VIP ONLY / NOT WORKING
// Init
import "./gui/ConfigGUIInit"

// eval command
register("command", command => {
  eval(command)
}).setName("eval")

// blingbling fix
// adds nuker support </3
let f
try {
  f = FileLib.read("BlingBlingAddons/util", "BlingPlayer.js")
} catch (e) {
  ChatLib.chat("&c[ERROR] Failed to read BlingPlayer.js: " + e)
  f = null
}

const bug = "this.mined = {};"
const patch =
  'this.mined  = {}; register("packetSent", (packet) => { let block = Player.lookingAt(); if (block.getClass() === Block) { this.hitBlocks.set(getcoords(block), { type: block.getMetadata(), time: Date.now(), }); } }).setFilteredClass(net.minecraft.network.play.client.C0APacketAnimation)'

if (f && f.includes(bug)) {
  try {
    FileLib.write("BlingBlingAddons/util", "BlingPlayer.js", f.replace(bug, patch))
    const trigger = register("worldLoad", () => {
      trigger.unregister()
      ChatTriggers.reloadCT()
    })
  } catch (e) {
    ChatLib.chat("&c[ERROR] Failed to write to BlingPlayer.js: " + e)
  }
}
