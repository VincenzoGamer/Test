let {  chat, Rotations, Vec3, aStarRdbt, Utils, PathHelper, PathFinder, Vector, RenderUtils, ItemUtils } = global.export
class devUtils {
  constructor() {
    register("command", () => {
      let cords = Utils.playerCords().floor
      let text = "[" + cords[0] + "," + cords[1] + "," + cords[2] + "]"
      chat.message(text + " to clipboard")
      ChatLib.command("ct copy " + text, true)
    }).setName("addwaypoint1")

    register("command", arg => {
      let cords = Utils.playerCords().floor
      let text = "new Point(" + cords[0] + "," + cords[1] + "," + cords[2] + "," + arg + ")"
      chat.message(text + " to clipboard")
      ChatLib.command("ct copy " + text, true)
    }).setName("addwaypoint2")

    register("command", arg => {
      let cords = Utils.playerCords().floor
      let text = "" + cords[0] + "," + (cords[1] - 1) + "," + cords[2] + ""
      chat.message(text + " to clipboard")
      ChatLib.command("ct copy " + text, true)
    }).setName("addwaypoint3")

    register("command", (x, y, z) => {
      if (x === undefined || y === undefined || z === undefined) {
        Rotations.rotateToVec3(0.0, 0.0)
        return
      }
      try {
        Rotations.rotateTo(new Vec3(parseInt(x.toString()), parseInt(y.toString()), parseInt(z.toString())))
      } catch (error) {}
    }).setName("lookat")

    register("command", () => {
      let entities = World.getAllPlayers()
      entities.forEach(entity => {
        ChatLib.chat(entity.getName() + ".")
      })
    }).setName("debugplayers")

    register("command", () => {
      let entities = World.getAllEntities()
      entities.forEach(entity => {
        ChatLib.chat(entity.getClassName() + " & " + entity.getName())
      })
    }).setName("debugentities")

    register("command", () => {
      let tabItems = TabList.getNames()

      tabItems.forEach((item) => {
        if (item.removeFormatting()?.startsWith(" Vanguard: ")) {
          chat.debugMessage("In Vanguard Mineshaft")
          return
        }
      })
    }).setName("testvangaurd")

    register("command", () => {
      let tabItems = TabList.getNames()

      tabItems.forEach((item) => {
        chat.message(item.removeFormatting())
        })
    }).setName("dumptab")

    register("command", () => {
      Rotations.rotateTo(new Vec3(3.5, 132.5, 376.5))
      ChatLib.chat(Utils.playerIsCollided())
    }).setName("rotate2")

    register("command", (x, y, z) => {
      global.export.PathHelper.goto([x, y, z])
    }).setName("goto")

    register("command", (x, y, z) => {
            global.export.PathHelper.goto([-138.5, 3, -170.5])
            chat.message("walking start")
            global.export.PathHelper.onFinish(() => {
              chat.message("walking done")
              Rotations.rotateTo(new Vec3(-138.5, 5, -170.5))
              Rotations.onEndRotation(() => {
                ItemUtils.rightClick()
              })
            })
    }).setName("openvanguard")

    register("command", () => {
      let block = Player.lookingAt()
      if (block instanceof Block) {
        ChatLib.chat("metadata: " + block.getMetadata())
        ChatLib.chat("blockid: " + block.type.getID())
      } else {
        ChatLib.chat(block)
      }
    }).setName("blockinfo")
  }
}

new devUtils()