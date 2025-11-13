package ob.hotkeys
{
    import flash.display.Stage;
    import flash.events.EventDispatcher;
    import flash.events.KeyboardEvent;
    import flash.text.TextField;
    import flash.text.TextFieldType;
    import flash.utils.Dictionary;

    import mx.core.IIMESupport;

    import ob.events.HotkeyManagerEvent;
    import ob.settings.ObjectBuilderSettings;

    import spark.components.TextInput;
    import flash.text.TextField;

    public class HotkeyManager extends EventDispatcher
    {

        //------------------------------------------------------------------
        //  PROPERTIES
        //------------------------------------------------------------------

        private var _stage:Stage;
        private var _definitions:Array = [];
        private var _definitionsById:Dictionary = new Dictionary();
        private var _definitionsBySignature:Dictionary = new Dictionary();
        private var _handlers:Dictionary = new Dictionary();
        private var _tooltipBindings:Dictionary = new Dictionary(true);

        //------------------------------------------------------------------
        //  CONSTRUCTOR
        //------------------------------------------------------------------

        public function HotkeyManager(stage:Stage)
        {
            super();
            _stage = stage;
            if (_stage)
                _stage.addEventListener(KeyboardEvent.KEY_DOWN, stageKeyDownHandler, false, 1, true);
        }

        //------------------------------------------------------------------
        //  PUBLIC API
        //------------------------------------------------------------------

        public function dispose():void
        {
            if (_stage)
                _stage.removeEventListener(KeyboardEvent.KEY_DOWN, stageKeyDownHandler);
        }

        public function registerAction(id:String, label:String, category:String, defaultHotkey:Hotkey = null):void
        {
            if (!id || _definitionsById[id])
                return;

            var definition:HotkeyDefinition = new HotkeyDefinition(id, label, category, defaultHotkey);
            _definitions.push(definition);
            _definitionsById[id] = definition;

            if (definition.hotkey)
                _definitionsBySignature[definition.hotkey.signature] = definition;
        }

        public function addHandler(actionId:String, handler:Function):void
        {
            if (!actionId || handler == null)
                return;

            var list:Vector.<Function> = _handlers[actionId];
            if (!list)
            {
                list = new Vector.<Function>();
                _handlers[actionId] = list;
            }

            if (list.indexOf(handler) == -1)
                list.push(handler);
        }

        public function removeHandler(actionId:String, handler:Function):void
        {
            var list:Vector.<Function> = _handlers[actionId];
            if (!list)
                return;

            var index:int = list.indexOf(handler);
            if (index != -1)
                list.splice(index, 1);
        }

        public function get definitions():Array
        {
            return _definitions.concat();
        }

        public function getHotkey(actionId:String):Hotkey
        {
            var definition:HotkeyDefinition = _definitionsById[actionId];
            return definition && definition.hotkey ? definition.hotkey.clone() : null;
        }

        public function load(settings:ObjectBuilderSettings):void
        {
            resetToDefaults(false);

            if (!settings || !settings.hotkeysConfig)
            {
                dispatchAllChanged();
                return;
            }

            var data:Object;
            try
            {
                data = JSON.parse(settings.hotkeysConfig);
            }
            catch (error:Error)
            {
                data = null;
            }

            if (data)
            {
                for (var key:String in data)
                {
                    var value:Object = data[key];
                    var definition:HotkeyDefinition = _definitionsById[key];
                    if (!definition)
                        continue;

                    if (value === "")
                    {
                        assignHotkey(definition, null, false);
                    }
                    else if (value is String)
                    {
                        var hotkey:Hotkey = Hotkey.fromConfigString(String(value));
                        if (hotkey)
                            assignHotkey(definition, hotkey, false);
                    }
                }
            }

            dispatchAllChanged();
        }

        public function persist(settings:ObjectBuilderSettings):void
        {
            if (!settings)
                return;

            var data:Object = {};
            for each (var definition:HotkeyDefinition in _definitions)
            {
                if (definition.hotkey)
                {
                    data[definition.id] = definition.hotkey.toConfigString();
                }
                else if (definition.defaultHotkey)
                {
                    data[definition.id] = "";
                }
            }

            try
            {
                settings.hotkeysConfig = JSON.stringify(data);
            }
            catch (error:Error)
            {
                settings.hotkeysConfig = null;
            }
        }

        public function updateHotkey(actionId:String, hotkey:Hotkey):void
        {
            var definition:HotkeyDefinition = _definitionsById[actionId];
            if (!definition)
                return;

            assignHotkey(definition, hotkey, true);
        }

        public function resetHotkey(actionId:String):void
        {
            var definition:HotkeyDefinition = _definitionsById[actionId];
            if (!definition)
                return;

            assignHotkey(definition, definition.defaultHotkey ? definition.defaultHotkey.clone() : null, true);
        }

        public function bindTooltip(target:Object, actionId:String, baseText:String = null):void
        {
            if (!target)
                return;

            var binding:TooltipBinding = new TooltipBinding();
            binding.target = target;
            binding.actionId = actionId;
            binding.baseText = baseText != null ? baseText : deriveBaseText(target);

            _tooltipBindings[target] = binding;
            updateTooltip(binding);
        }

        public function unbindTooltip(target:Object):void
        {
            if (target && _tooltipBindings[target])
                delete _tooltipBindings[target];
        }

        //------------------------------------------------------------------
        //  PRIVATE METHODS
        //------------------------------------------------------------------

        private function resetToDefaults(dispatch:Boolean):void
        {
            _definitionsBySignature = new Dictionary();

            for each (var definition:HotkeyDefinition in _definitions)
            {
                var defaultHotkey:Hotkey = definition.defaultHotkey ? definition.defaultHotkey.clone() : null;
                definition.hotkey = defaultHotkey;

                if (defaultHotkey)
                    _definitionsBySignature[defaultHotkey.signature] = definition;

                if (dispatch)
                    dispatchHotkeyChanged(definition);
            }
        }

        private function dispatchAllChanged():void
        {
            for each (var definition:HotkeyDefinition in _definitions)
            {
                dispatchHotkeyChanged(definition);
            }
        }

        private function dispatchHotkeyChanged(definition:HotkeyDefinition):void
        {
            var event:HotkeyManagerEvent = new HotkeyManagerEvent(HotkeyManagerEvent.HOTKEY_CHANGED, definition.id, definition.hotkey);
            for (var target:Object in _tooltipBindings)
            {
                var binding:TooltipBinding = _tooltipBindings[target];
                if (binding && binding.actionId == definition.id)
                    updateTooltip(binding);
            }
            dispatchEvent(event);
        }

        private function assignHotkey(definition:HotkeyDefinition, hotkey:Hotkey, dispatch:Boolean):void
        {
            if (hotkey && hotkey.isEmpty)
                hotkey = null;

            if (definition.hotkey && hotkey && definition.hotkey.equals(hotkey))
                return;

            if (definition.hotkey)
                delete _definitionsBySignature[definition.hotkey.signature];

            if (hotkey)
            {
                var signature:String = hotkey.signature;
                var existing:HotkeyDefinition = _definitionsBySignature[signature];
                if (existing && existing != definition)
                {
                    existing.hotkey = null;
                    delete _definitionsBySignature[signature];
                    if (dispatch)
                        dispatchHotkeyChanged(existing);
                }

                definition.hotkey = hotkey.clone();
                _definitionsBySignature[signature] = definition;
            }
            else
            {
                definition.hotkey = null;
            }

            if (dispatch)
                dispatchHotkeyChanged(definition);
        }

        private function stageKeyDownHandler(event:KeyboardEvent):void
        {
            if (shouldIgnoreTarget(event))
                return;

            var hotkey:Hotkey = Hotkey.fromKeyboardEvent(event);
            if (!hotkey)
                return;

            var definition:HotkeyDefinition = _definitionsBySignature[hotkey.signature];
            if (!definition)
                return;

            event.preventDefault();
            event.stopImmediatePropagation();

            trigger(definition.id);
        }

        private function shouldIgnoreTarget(event:KeyboardEvent):Boolean
        {
            var target:Object = event.target;
            if (target is TextField)
            {
                return TextField(target).type == TextFieldType.INPUT;
            }

            if (target is TextField)
                return true;

            if (target is TextInput)
                return true;

            if (target is IIMESupport && IIMESupport(target).enableIME)
                return true;

            return false;
        }

        private function trigger(actionId:String):void
        {
            var handlers:Vector.<Function> = _handlers[actionId];
            if (!handlers)
                return;

            for each (var handler:Function in handlers)
            {
                if (handler != null)
                    handler();
            }
        }

        private function updateTooltip(binding:TooltipBinding):void
        {
            if (!binding || !binding.target)
                return;

            var definition:HotkeyDefinition = _definitionsById[binding.actionId];
            var hotkeyLabel:String = definition && definition.hotkey ? definition.hotkey.toString() : "";
            var text:String = binding.baseText;

            if (text && text.length > 0)
            {
                if (hotkeyLabel && hotkeyLabel.length > 0)
                    binding.target["toolTip"] = text + " (" + hotkeyLabel + ")";
                else
                    binding.target["toolTip"] = text;
            }
            else
            {
                binding.target["toolTip"] = hotkeyLabel && hotkeyLabel.length > 0 ? hotkeyLabel : null;
            }
        }

        private function deriveBaseText(target:Object):String
        {
            if (!target)
                return "";

            if (target.hasOwnProperty("toolTip") && target["toolTip"])
                return String(target["toolTip"]);

            if (target.hasOwnProperty("label") && target["label"])
                return String(target["label"]);

            return "";
        }
    }
}
