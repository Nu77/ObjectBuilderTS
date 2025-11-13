export class OBDVersions {
    public static readonly OBD_VERSION_1: number = 100;
    public static readonly OBD_VERSION_2: number = 200;
    public static readonly OBD_VERSION_3: number = 300;

    private constructor() {
        throw new Error("OBDVersions is a static class and cannot be instantiated");
    }
}

