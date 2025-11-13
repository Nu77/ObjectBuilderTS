package ob.hotkeys
{
    import flash.events.KeyboardEvent;
    import flash.ui.Keyboard;

    import mx.utils.StringUtil;

    public class Hotkey
    {
        //------------------------------------------------------------------
        //  PROPERTIES
        //------------------------------------------------------------------

        public var keyCode:uint;
        public var ctrl:Boolean;
        public var shift:Boolean;
        public var alt:Boolean;

        //------------------------------------------------------------------
        //  CONSTRUCTOR
        //------------------------------------------------------------------

        public function Hotkey(keyCode:uint = 0, ctrl:Boolean = false, shift:Boolean = false, alt:Boolean = false)
        {
            this.keyCode = keyCode;
            this.ctrl = ctrl;
            this.shift = shift;
            this.alt = alt;
        }

        //------------------------------------------------------------------
        //  STATIC
        //------------------------------------------------------------------

        public static function fromKeyboardEvent(event:KeyboardEvent):Hotkey
        {
            if (!event)
                return null;

            var code:uint = event.keyCode;

            // Ignore modifier-only presses.
            if (isModifierKey(code))
                return null;

            var ctrl:Boolean = event.ctrlKey || event.commandKey;
            var alt:Boolean = event.altKey;
            var shift:Boolean = event.shiftKey;

            return new Hotkey(code, ctrl, shift, alt);
        }

        public static function fromConfigString(value:String):Hotkey
        {
            if (!value)
                return null;

            var parts:Array = value.split(":");
            if (parts.length != 4)
                return null;

            var code:uint = uint(parts[0]);
            var ctrl:Boolean = parts[1] == "1";
            var shift:Boolean = parts[2] == "1";
            var alt:Boolean = parts[3] == "1";

            if (code == 0)
                return null;

            return new Hotkey(code, ctrl, shift, alt);
        }

        public static function fromKeyCode(code:uint, ctrl:Boolean = false, shift:Boolean = false, alt:Boolean = false):Hotkey
        {
            if (code == 0)
                return null;

            return new Hotkey(code, ctrl, shift, alt);
        }

        public static function isModifierKey(code:uint):Boolean
        {
            switch (code)
            {
                case Keyboard.ALTERNATE:
                case Keyboard.CONTROL:
                case Keyboard.SHIFT:
                case Keyboard.COMMAND:
                case Keyboard.CAPS_LOCK:
                    return true;
            }

            return false;
        }

        public static function keyLabelForCode(code:uint):String
        {
            switch (code)
            {
                case Keyboard.BACKSPACE:
                    return "Backspace";

                case Keyboard.TAB:
                    return "Tab";

                case Keyboard.ENTER:
                    return "Enter";

                case Keyboard.ESCAPE:
                    return "Escape";

                case Keyboard.SPACE:
                    return "Space";

                case Keyboard.DELETE:
                    return "Delete";

                case Keyboard.UP:
                    return "Up";

                case Keyboard.DOWN:
                    return "Down";

                case Keyboard.LEFT:
                    return "Left";

                case Keyboard.RIGHT:
                    return "Right";

                case Keyboard.PAGE_UP:
                    return "PageUp";

                case Keyboard.PAGE_DOWN:
                    return "PageDown";

                case Keyboard.HOME:
                    return "Home";

                case Keyboard.END:
                    return "End";

                case Keyboard.INSERT:
                    return "Insert";

                case Keyboard.NUMPAD_ENTER:
                    return "NumpadEnter";

                case Keyboard.NUMPAD_ADD:
                    return "Numpad+";

                case Keyboard.NUMPAD_SUBTRACT:
                    return "Numpad-";

                case Keyboard.NUMPAD_MULTIPLY:
                    return "Numpad*";

                case Keyboard.NUMPAD_DIVIDE:
                    return "Numpad/";

                case Keyboard.NUMPAD_DECIMAL:
                    return "Numpad.";

                case Keyboard.NUMPAD:
                    return "Numpad";
            }

            if (code >= Keyboard.F1 && code <= Keyboard.F15)
            {
                return "F" + String(code - Keyboard.F1 + 1);
            }

            // Printable characters.
            if ((code >= 48 && code <= 57) || // numbers
                (code >= 65 && code <= 90))   // letters
            {
                return String.fromCharCode(code);
            }

            if (code >= 96 && code <= 105)
            {
                return "Numpad" + String(code - 96);
            }

            // Punctuation fallback.
            var char:String = String.fromCharCode(code);
            if (char && !StringUtil.isWhitespace(char))
                return char.toUpperCase();

            return String(code);
        }

        //------------------------------------------------------------------
        //  PUBLIC METHODS
        //------------------------------------------------------------------

        public function clone():Hotkey
        {
            return new Hotkey(keyCode, ctrl, shift, alt);
        }

        public function equals(other:Hotkey):Boolean
        {
            if (!other)
                return false;

            return other.keyCode == keyCode &&
                   other.ctrl == ctrl &&
                   other.shift == shift &&
                   other.alt == alt;
        }

        public function get isEmpty():Boolean
        {
            return keyCode == 0;
        }

        public function toConfigString():String
        {
            if (isEmpty)
                return "";

            return keyCode + ":" + (ctrl ? "1" : "0") + ":" + (shift ? "1" : "0") + ":" + (alt ? "1" : "0");
        }

        public function get signature():String
        {
            if (isEmpty)
                return "";

            return keyCode + "|" + (ctrl ? "1" : "0") + "|" + (shift ? "1" : "0") + "|" + (alt ? "1" : "0");
        }

        public function get keyLabel():String
        {
            return keyLabelForCode(keyCode);
        }

        public function toString():String
        {
            if (isEmpty)
                return "";

            var parts:Array = [];

            if (ctrl)
                parts.push("Ctrl");

            if (alt)
                parts.push("Alt");

            if (shift)
                parts.push("Shift");

            parts.push(keyLabel);

            return parts.join("+");
        }
    }
}
