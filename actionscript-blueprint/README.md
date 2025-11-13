# ActionScript Blueprint

## ⚠️ IMPORTANT: This Folder is a Blueprint for TypeScript Conversion

**This folder contains the original ActionScript source code from the Adobe AIR/Flash version of Object Builder.**

### Purpose

This folder serves as a **reference blueprint** for the TypeScript conversion project. The ActionScript code here should be used as a guide when:

- Implementing new TypeScript features
- Understanding the original architecture and design patterns
- Debugging issues by comparing with the original implementation
- Ensuring feature parity during conversion

### Status

The TypeScript conversion is **~93% complete**. Most of the backend functionality has been converted, and the UI is being rebuilt using React and Electron.

### Structure

This folder preserves the original directory structure from the `src/` folder:

```
actionscript-blueprint/
├── com/              # Third-party libraries (mignari)
├── gamelib/          # Game library utilities
├── nail/             # Nail framework components
├── ob/               # Object Builder specific code
│   ├── commands/     # Command pattern implementations
│   ├── components/   # UI components (MXML)
│   ├── hotkeys/      # Hotkey management
│   └── ...
├── objectview/       # Object viewer components
├── otlib/            # Open Tibia library
│   ├── animation/    # Animation system
│   ├── components/   # UI components
│   ├── core/         # Core classes
│   ├── things/       # Thing type system
│   ├── sprites/      # Sprite system
│   └── ...
├── slicer/           # Sprite slicer tool
├── store/            # Asset store
├── ObjectBuilder.mxml # Main application file
└── ObjectBuilderWorker.as # Worker thread implementation
```

### File Types

- **`.as` files**: ActionScript 3.0 source code
- **`.mxml` files**: Adobe Flex MXML UI component definitions

### For Future Developers/Agents

When working on this project:

1. **Reference this folder** when implementing new features or fixing bugs
2. **Compare implementations** between ActionScript and TypeScript to ensure correctness
3. **Preserve the architecture** - the original design patterns should be maintained
4. **Do NOT modify** files in this folder - it is a historical reference
5. **Use as documentation** - the ActionScript code serves as inline documentation

### Conversion Notes

- The TypeScript version uses Node.js instead of Adobe AIR
- UI is rebuilt with React instead of Flex/MXML
- Electron is used for desktop app instead of AIR runtime
- File operations use Node.js `fs` instead of AIR File API
- Image processing uses `sharp`/`canvas` instead of Flash BitmapData

### Related Files

- `asconfig.json` - Original ActionScript compiler configuration (legacy)
- `src/ObjectBuilder-app.xml` - Original AIR application descriptor (legacy)

### Original Technology Stack

- **Language**: ActionScript 3.0
- **Framework**: Adobe Flex
- **Runtime**: Adobe AIR
- **UI**: MXML + ActionScript
- **Build**: Apache Flex SDK / Flash Builder

---

**Note**: This folder is read-only. All active development happens in the TypeScript codebase in the `src/` folder.

