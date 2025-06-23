let { ModuleManager } = global.settingSelection

const Prefix = "&6Rdbt V4 &7» &r"
const Muted = false
const Debug = true
const date = new java.text.SimpleDateFormat("hh:mm:ss a z", java.util.Locale.US)

class ChatClass {
  /**
   * Sends a message with the client prefix.
   * @param {string} msg 
   */
  message(msg) {
    FileLib.append("RdbtConfigV4", "debug.txt", `[${date.format(Date.now())}] [Chat] ${msg}\n`)
    if (Muted) return
    if (!msg) return
    ChatLib.chat(Prefix + (msg ?? null))
  }

  /**
   * Sends a debug message with the client prefix.
   * @param {string} msg 
   */
  debugMessage(msg) {
    FileLib.append("RdbtConfigV4", "debug.txt", `[${date.format(Date.now())}] [Debug] ${msg}\n`)
    if (Muted) return
    if (!msg) return
    if (!global.settingSelection?.ModuleManager?.getSetting("Other", "Debug Messages")) return
    ChatLib.chat(Prefix + (msg ?? null))
  }

  /**
   * logs a message silently.
   * @param {string} msg 
   */
  log(msg) {
    FileLib.append("RdbtConfigV4", "debug.txt", `[${date.format(Date.now())}] [Other] ${msg}\n`)
  }

  /**
   * Clears the debug log file.
   */
  clearLog() {
    FileLib.write("RdbtConfigV4", "debug.txt", "")
    this.log("&aDebug log cleared.")
  }
}

// Clears debug.txt on game load.
register("gameLoad", () => {
  global.export.chat.clearLog()
  Client.scheduleTask(600, () => {
    global.export.chat.message("Thank you for using RdbtClient. Join the official discord at discord.gg/scatha for updates and annoucements!")
  })
})

global.export.chat = new ChatClass()
