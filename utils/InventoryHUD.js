let { SettingToggle, ConfigModuleClass, ModuleManager, SettingSlider } = global.settingSelection
let { GuiUtils } = global.export;
const Color = Java.type("java.awt.Color");


global.modules.push(
  new ConfigModuleClass(
    "Inventory hud",
    "Render",
    [
      new SettingToggle("Enabled", false),
    ],
    ["Shows your inventory", "only color available is purple atm!"],
  ),
)

class invHUD {
  constructor() {
    this.ModuleName = "Inventory hud"

const width = 190;
const height = 90;
const radius = 5;

const width2 = 200;
const height2 = 3;

const width3 = 3;
const height3 = 103;


const pad = 5;
const slot = 20;
const titleH = 20;
const mainH = 60;
const scale = 1;
const cols = 9;
const maxRows = 3;

register("step", () => {
      this.Enabled = ModuleManager.getSetting(this.ModuleName, "Enabled")
    }).setFps(1)

register("renderOverlay", () => {
  const screenHeight = Renderer.screen.getHeight();
  const x = 750;
  const y = screenHeight - height - 20;
  const inv = Player.getInventory();
  const items = inv.getItems();
  const hotbar = items.slice(0, 9);
  const main = items.slice(9, 36);

  if (this.Enabled) {

  GuiUtils.DrawRoundedRect(new Color(0, 0, 0, 0.2), x, y, width, height, radius);

  GuiUtils.DrawRoundedRect(new Color(1, 0, 1, 1), x - 5, y - 5, width2, height2, radius);
  GuiUtils.DrawRoundedRect(new Color(1, 0, 1, 1), x - 5, y + 93, width2, height2, radius);

  GuiUtils.DrawRoundedRect(new Color(1, 0, 1, 1), x - 5, y - 6, width3, height3, radius);
  GuiUtils.DrawRoundedRect(new Color(1, 0, 1, 1), x + 192, y - 6, width3, height3, radius);
  
 
 hotbar.forEach((item, i) => {
  if (!item) return;
  const sx = x + pad + i * slot;
  const sy = y + titleH + pad + mainH + pad;
  const selected = Player.getHeldItemIndex();
  if (i === selected) {
   // Renderer.drawRect(0x8000FF00, sx - 1, sy - 11, sx + slot + 1, sy + slot - 11);
  }
  item.draw(sx, sy - 19, scale);

  const stack = item.getItemStack();
  const count = stack.stackSize;
  if (count > 1) {
    GL11.glDisable(GL11.GL_DEPTH_TEST);
    Renderer.drawString(
      count.toString(),
      sx + slot - Renderer.getStringWidth(count.toString()) - 1,
      sy - 19 + 3
    );
    GL11.glEnable(GL11.GL_DEPTH_TEST);
  }
});


  main.forEach((item, i) => {
    if (!item) return;
    const col = i % cols,
      row = Math.floor(i / cols);
    if (row >= maxRows) return;
    const sx = x + pad + col * slot;
    const sy = y + titleH + pad + row * slot;
    item.draw(sx, sy - 14, scale);

    const stack = item.getItemStack();
    const count = stack.stackSize;
    if (count > 1) {
      GL11.glDisable(GL11.GL_DEPTH_TEST);
      Renderer.drawString(
        count.toString(),
        sx + slot - Renderer.getStringWidth(count.toString()) - 1,
        sy - 14 + 3
      );
      GL11.glEnable(GL11.GL_DEPTH_TEST);
    }

  });
}
});  
  }
}


new invHUD()