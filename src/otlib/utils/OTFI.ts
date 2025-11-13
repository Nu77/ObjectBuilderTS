import * as fs from "fs";
import * as path from "path";

/**
 * OTFI (OT File Info) - Stores metadata about .dat and .spr files
 * Uses a simplified JSON format instead of OTML for now
 */
export class OTFI {
    public extended: boolean = false;
    public transparency: boolean = false;
    public improvedAnimations: boolean = false;
    public frameGroups: boolean = false;
    public metadataFile: string | null = null;
    public spritesFile: string | null = null;
    public spriteSize: number = 0;
    public spriteDataSize: number = 0;

    constructor(extended: boolean = false,
                transparency: boolean = false,
                improvedAnimations: boolean = false,
                frameGroups: boolean = false,
                metadataFile: string | null = null,
                spritesFile: string | null = null,
                spriteSize: number = 0,
                spriteDataSize: number = 0) {
        this.extended = extended;
        this.transparency = transparency;
        this.improvedAnimations = improvedAnimations;
        this.frameGroups = frameGroups;
        this.metadataFile = metadataFile;
        this.spritesFile = spritesFile;
        this.spriteSize = spriteSize;
        this.spriteDataSize = spriteDataSize;
    }

    public toString(): string {
        return `[OTFI extended=${this.extended}, transparency=${this.transparency}, ` +
               `improvedAnimations=${this.improvedAnimations}, frameGroups=${this.frameGroups}, ` +
               `spriteSize=${this.spriteSize}, spriteDataSize=${this.spriteDataSize}]`;
    }

    public load(filePath: string): boolean {
        if (!filePath) {
            throw new Error("file cannot be null");
        }

        if (!fs.existsSync(filePath)) {
            return false;
        }

        const ext = path.extname(filePath).toLowerCase();
        if (ext !== ".otfi") {
            return false;
        }

        try {
            // For now, use JSON format (can be enhanced to support OTML later)
            const content = fs.readFileSync(filePath, "utf8");
            const data = JSON.parse(content);

            if (!data.DatSpr) {
                return false;
            }

            const node = data.DatSpr;
            this.extended = node.extended || false;
            this.transparency = node.transparency || false;
            this.improvedAnimations = node["frame-durations"] || false;
            this.frameGroups = node["frame-groups"] || false;
            this.metadataFile = node["metadata-file"] || null;
            this.spritesFile = node["sprites-file"] || null;
            this.spriteSize = node["sprite-size"] || 0;
            this.spriteDataSize = node["sprite-data-size"] || 0;

            return true;
        } catch (error) {
            // Try to parse as OTML format (basic parsing)
            return this.loadOTML(filePath);
        }
    }

    private loadOTML(filePath: string): boolean {
        try {
            const content = fs.readFileSync(filePath, "utf8");
            
            // Basic OTML parsing - look for DatSpr section
            const datSprMatch = content.match(/DatSpr\s*\{([^}]+)\}/);
            if (!datSprMatch) {
                return false;
            }

            const datSprContent = datSprMatch[1];
            
            // Parse key-value pairs
            const parseValue = (key: string, defaultValue: any = false): any => {
                const regex = new RegExp(`${key}\\s*=\\s*([^\\n]+)`, "i");
                const match = datSprContent.match(regex);
                if (!match) return defaultValue;
                
                const value = match[1].trim();
                if (value === "true") return true;
                if (value === "false") return false;
                if (/^\d+$/.test(value)) return parseInt(value, 10);
                if (value.startsWith('"') && value.endsWith('"')) {
                    return value.slice(1, -1);
                }
                return value;
            };

            this.extended = parseValue("extended", false);
            this.transparency = parseValue("transparency", false);
            this.improvedAnimations = parseValue("frame-durations", false);
            this.frameGroups = parseValue("frame-groups", false);
            this.metadataFile = parseValue("metadata-file", null);
            this.spritesFile = parseValue("sprites-file", null);
            this.spriteSize = parseValue("sprite-size", 0);
            this.spriteDataSize = parseValue("sprite-data-size", 0);

            return true;
        } catch (error) {
            return false;
        }
    }

    public save(filePath: string): boolean {
        if (!filePath) {
            throw new Error("file cannot be null");
        }

        try {
            // Check if it's a directory
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    return false;
                }
            }

            // Save as JSON format (can be enhanced to support OTML later)
            const data = {
                DatSpr: {
                    extended: this.extended,
                    transparency: this.transparency,
                    "frame-durations": this.improvedAnimations,
                    "frame-groups": this.frameGroups,
                    ...(this.metadataFile ? { "metadata-file": this.metadataFile } : {}),
                    ...(this.spritesFile ? { "sprites-file": this.spritesFile } : {}),
                    ...(this.spriteSize ? { "sprite-size": this.spriteSize } : {}),
                    ...(this.spriteDataSize ? { "sprite-data-size": this.spriteDataSize } : {})
                }
            };

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
            return true;
        } catch (error) {
            return false;
        }
    }
}

