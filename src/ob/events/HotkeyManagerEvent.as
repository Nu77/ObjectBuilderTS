package ob.events
{
    import flash.events.Event;

    import ob.hotkeys.Hotkey;

    public class HotkeyManagerEvent extends Event
    {
        public static const HOTKEY_CHANGED:String = "hotkeyChanged";

        public var actionId:String;
        public var hotkey:Hotkey;

        public function HotkeyManagerEvent(type:String, actionId:String, hotkey:Hotkey)
        {
            super(type, false, false);
            this.actionId = actionId;
            this.hotkey = hotkey ? hotkey.clone() : null;
        }

        override public function clone():Event
        {
            return new HotkeyManagerEvent(type, actionId, hotkey);
        }
    }
}
