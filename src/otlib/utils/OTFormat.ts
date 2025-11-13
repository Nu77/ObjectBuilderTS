export class OTFormat {
    public static readonly OTBM: string = "otbm";
    public static readonly OTB: string = "otb";
    public static readonly OBD: string = "obd";
    public static readonly DAT: string = "dat";
    public static readonly SPR: string = "spr";
    public static readonly XML: string = "xml";
    public static readonly LUA: string = "lua";

    private constructor() {
        throw new Error("OTFormat is a static class and cannot be instantiated");
    }
}

