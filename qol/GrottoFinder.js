let { chat, RenderUtils } = global.export;
let { SettingToggle, ConfigModuleClass, ModuleManager } = global.settingSelection;
import Skyblock from "BloomCore/Skyblock";
import Async from "Async";

global.modules.push(new ConfigModuleClass(
  "Grotto Finder",
  "Render",
  [new SettingToggle("Enabled", false)],
  ["Highlights fairy grottos in the Crystal Hollows (not working)"]
));

class GrottoFinder {
  constructor() {
    this.ModuleName = "Grotto Finder";
    this.Enabled = false;

    this.chunkRadius = 10; // radius 5 chunks - this is not to be made a slider as it causes major lag problems if increased
    this.totalMatches = [];
    this.chunksToScan = [];
    this.currentVeinBlocks = [];
    this.isScanning = false;
    this.scanStartTime = 0;
    this.chunkPromises = [];
    this.completedChunks = 0;
    this.totalChunks = 0;
    this.foundBlockCoords = new Set(); // Optimization 8: Use Set for faster duplicate detection
    this.maxConcurrentThreads = 8; // Optimization 5: Limit concurrent threads
    this.activeThreads = 0;
    this.chunkQueue = [];

    this.scanSingleChunk = this.scanSingleChunk.bind(this);
    this.checkScanCompletion = this.checkScanCompletion.bind(this);
    this.processChunkBatch = this.processChunkBatch.bind(this);

    register("step", () => {
      this.Enabled = ModuleManager.getSetting(this.ModuleName, "Enabled");
      if (!this.Enabled) {
        this.reset();
        return;
      }

      // if (Skyblock.area !== "Crystal Hollows") { off for testing
      //   this.reset();
      //   return;
      // }

      if (!this.isScanning && this.currentVeinBlocks.length === 0) {
        this.startScan();
      }
    }).setFps(1);

    register("renderWorld", () => {
      if (!this.Enabled || this.currentVeinBlocks.length === 0) return;

      this.currentVeinBlocks.forEach(block => {
        RenderUtils.renderCube(
          [block.x, block.y, block.z],
          [1, 0, 1], 
          true,
          0.25,
          1,
          1
        );
      });
    });
  }

  reset() {
    this.totalMatches.length = 0;
    this.chunksToScan.length = 0;
    this.currentVeinBlocks.length = 0;
    this.chunkPromises.length = 0;
    this.chunkQueue.length = 0;
    this.foundBlockCoords.clear();
    
    this.isScanning = false;
    this.completedChunks = 0;
    this.totalChunks = 0;
    this.activeThreads = 0;
  }

  /**
   * Initialize and start the grotto scanning process
   * Clears previous results and sets up chunk queue for threaded processing
   */
  startScan() {
    // Clear previous scan data
    this.totalMatches.length = 0;
    this.chunksToScan.length = 0;
    this.currentVeinBlocks.length = 0;
    this.chunkQueue.length = 0;
    this.foundBlockCoords.clear();
    
    // Initialize scan state
    this.isScanning = true;
    this.scanStartTime = Date.now();
    this.chunkPromises.length = 0;
    this.completedChunks = 0;
    this.activeThreads = 0;

    // Calculate player's current chunk coordinates
    const cx = Math.floor(Player.getX() / 16);
    const cz = Math.floor(Player.getZ() / 16);

    // Calculate total number of chunks to scan
    const diameter = (this.chunkRadius * 2) + 1;
    this.totalChunks = diameter * diameter;

    chat.message(`§b[Finder] Starting optimized threaded scan of ${this.totalChunks} chunks around player (radius ${this.chunkRadius})...`);

    // Populate chunk queue with all chunks in radius
    for (let dx = -this.chunkRadius; dx <= this.chunkRadius; dx++) {
      for (let dz = -this.chunkRadius; dz <= this.chunkRadius; dz++) {
        this.chunkQueue.push({ x: cx + dx, z: cz + dz });
      }
    }

    // Start processing chunks and monitoring completion
    this.processChunkBatch();
    this.checkScanCompletion();
  }



  /**
   * Manages the thread pool for concurrent chunk processing
   * Ensures we don't exceed maxConcurrentThreads to maintain stability
   */
  processChunkBatch() {
    if (!this.isScanning || this.chunkQueue.length === 0) return;
    
    // Start new threads up to the configured limit
    while (this.activeThreads < this.maxConcurrentThreads && this.chunkQueue.length > 0) {
      const chunk = this.chunkQueue.shift();
      this.activeThreads++;
      
      // Create async task for chunk scanning
      const promise = Async.run(() => {
        this.scanSingleChunk(chunk.x, chunk.z);
        this.activeThreads--;
        
        // Continue processing remaining chunks
        this.processChunkBatch();
      });
      
      this.chunkPromises.push(promise);
    }
  }

  /**
   * Scan a single chunk for grotto blocks in a separate thread
   * @param {number} chunkX - X coordinate of the chunk
   * @param {number} chunkZ - Z coordinate of the chunk
   */
  scanSingleChunk(chunkX, chunkZ) {
    if (!this.isScanning) return;

    let matches = this.findStainedGlassInChunk(chunkX, chunkZ);
    
    // Add all matches to total results (thread-safe operation)
    this.totalMatches.push(...matches);

    // Use Set for fast duplicate detection and add unique blocks to render list
    matches.forEach(block => {
      const key = this.getcoords(block);
      if (!this.foundBlockCoords.has(key)) {
        this.foundBlockCoords.add(key);
        this.currentVeinBlocks.push(block);
      }
    });

    // Update progress counter
    this.completedChunks++;
    
    chat.debugMessage(`§b[Finder] Thread scanned chunk ${chunkX}, ${chunkZ} (${this.completedChunks}/${this.totalChunks} complete, ${this.totalMatches.length} total matches)`);
  }

  /**
   * Monitor scanning progress and handle completion
   * Reports progress at 20% intervals and detects when scanning is finished
   */
  checkScanCompletion() {
    if (!this.isScanning) return;

    // Check if scanning is complete
    if (this.completedChunks >= this.totalChunks) {
      const elapsed = ((Date.now() - this.scanStartTime) / 1000).toFixed(2);
      chat.message(`§a[Finder] Finished optimized threaded scanning in §b${elapsed}s§a. Total matches: §d${this.totalMatches.length}`);
      this.isScanning = false;
      return;
    }

    // Schedule next completion check
    Async.schedule(() => {
      this.checkScanCompletion();
    }, 50); // Check every 50ms for responsive completion detection
  }

  /**
   * Get block information at a specific position with performance optimization
   * @param {BlockPos} pos - The position to check
   * @returns {Object|null} Block object with name, coordinates, and color, or null if not stained glass
   */
  getInternalBlockAt(pos) {
    let block = World.getBlockAt(pos);
    let blockID = block.type.getID();
    
    if (blockID === 95 || blockID === 160) {
      if (block.getMetadata() == 2) {
        return block;
      }  
    } 

    return null;
  }

  /**
   * Scan a single chunk for magenta stained glass blocks (grotto indicators)
   * @param {number} chunkX - X coordinate of the chunk
   * @param {number} chunkZ - Z coordinate of the chunk
   * @returns {Array} Array of found grotto blocks
   */
  findStainedGlassInChunk(chunkX, chunkZ) {
    let foundBlocks = [];
    
    // Scan all blocks in the chunk within Crystal Hollows Y range
    const worldXBase = chunkX * 16;
    const worldZBase = chunkZ * 16;

    for (let x = 0; x < 16; x++) {
      for (let y = 37; y <= 180; y++) { // Crystal Hollows Y levels
        for (let z = 0; z < 16; z++) {
          let block = this.getInternalBlockAt(new BlockPos(worldXBase + x, y, worldZBase + z));

          // Check if block matches grotto criteria
          if (block) {
            foundBlocks.push(block);
          }
        }
      }
    }
    return foundBlocks;
  }

  /**
   * Generate a coordinate string for block identification
   * @param {Object} block - Block object with x, y, z properties
   * @returns {string} Coordinate string in format "x,y,z"
   */
  getcoords(block) {
    return `${block.x},${block.y},${block.z}`;
  }
}

/**
 * Command to manually clear all highlighted grotto blocks
 * Usage: /cleargrotto
 */
register("command", () => {
  currentVeinBlocks = [];
  chat.message("§b[Grotto Finder] Cleared highlighted grottos.");
}).setName("cleargrotto");

new GrottoFinder();