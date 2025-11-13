package ob.hotkeys
{
    public class HotkeyDefinition
    {
        //------------------------------------------------------------------
        //  PROPERTIES
        //------------------------------------------------------------------

        public var id:String;
        public var label:String;
        public var category:String;
        public var defaultHotkey:Hotkey;
        public var hotkey:Hotkey;

        //------------------------------------------------------------------
        //  CONSTRUCTOR
        //------------------------------------------------------------------

        public function HotkeyDefinition(id:String, label:String, category:String, defaultHotkey:Hotkey)
        {
            this.id = id;
            this.label = label;
            this.category = category;
            this.defaultHotkey = defaultHotkey ? defaultHotkey.clone() : null;
            this.hotkey = this.defaultHotkey ? this.defaultHotkey.clone() : null;
        }

        //------------------------------------------------------------------
        //  METHODS
        //------------------------------------------------------------------

        public function clone():HotkeyDefinition
        {
            var copy:HotkeyDefinition = new HotkeyDefinition(id, label, category, defaultHotkey);
            copy.hotkey = hotkey ? hotkey.clone() : null;
            return copy;
        }

        public function usesDefault():Boolean
        {
            if (!defaultHotkey && !hotkey)
                return true;

            if (defaultHotkey && hotkey)
                return defaultHotkey.equals(hotkey);

            return false;
        }
    }
}
