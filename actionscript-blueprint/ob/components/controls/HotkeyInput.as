package ob.components.controls
{
    import flash.events.Event;
    import flash.events.FocusEvent;
    import flash.events.KeyboardEvent;
    import flash.ui.Keyboard;

    import mx.resources.IResourceManager;
    import mx.resources.ResourceManager;

    import ob.hotkeys.Hotkey;

    import spark.components.TextInput;

    [Event(name="change", type="flash.events.Event")]

    public class HotkeyInput extends TextInput
    {
        //------------------------------------------------------------------
        //  PROPERTIES
        //------------------------------------------------------------------

        private var _hotkey:Hotkey;
        private var _resourceManager:IResourceManager;

        //------------------------------------------------------------------
        //  CONSTRUCTOR
        //------------------------------------------------------------------

        public function HotkeyInput()
        {
            super();
            editable = false;
            selectable = false;
            setStyle("textAlign", "center");
            _resourceManager = ResourceManager.getInstance();
            prompt = getPromptText();
        }

        //------------------------------------------------------------------
        //  PUBLIC API
        //------------------------------------------------------------------

        public function get hotkey():Hotkey
        {
            return _hotkey ? _hotkey.clone() : null;
        }

        public function set hotkey(value:Hotkey):void
        {
            var newValue:Hotkey = value ? value.clone() : null;
            if ((_hotkey && newValue && _hotkey.equals(newValue)) || (!_hotkey && !newValue))
                return;

            _hotkey = newValue;
            updateDisplay();
        }

        //------------------------------------------------------------------
        //  OVERRIDES
        //------------------------------------------------------------------

        override protected function keyDownHandler(event:KeyboardEvent):void
        {
            event.preventDefault();
            event.stopImmediatePropagation();

            if ((event.keyCode == Keyboard.DELETE || event.keyCode == Keyboard.BACKSPACE) &&
                !event.ctrlKey && !event.altKey && !event.shiftKey)
            {
                hotkey = null;
                dispatchEvent(new Event(Event.CHANGE));
                return;
            }

            var value:Hotkey = Hotkey.fromKeyboardEvent(event);
            if (!value)
                return;

            hotkey = value;
            dispatchEvent(new Event(Event.CHANGE));
        }

        override protected function focusInHandler(event:FocusEvent):void
        {
            super.focusInHandler(event);
            selectAll();
        }

        override protected function focusOutHandler(event:FocusEvent):void
        {
            super.focusOutHandler(event);
            updateDisplay();
        }

        //------------------------------------------------------------------
        //  PRIVATE METHODS
        //------------------------------------------------------------------

        private function updateDisplay():void
        {
            if (_hotkey)
            {
                text = _hotkey.toString();
                prompt = null;
            }
            else
            {
                text = "";
                prompt = getPromptText();
            }
        }

        private function getPromptText():String
        {
            return _resourceManager ? _resourceManager.getString("strings", "pressShortcut") : "";
        }
    }
}
