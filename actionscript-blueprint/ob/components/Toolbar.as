/*
*  Copyright (c) 2014-2023 Object Builder <https://github.com/ottools/ObjectBuilder>
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the "Software"), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

package ob.components
{
    import com.mignari.workers.IWorkerCommunicator;

    import flash.events.MouseEvent;

    import mx.core.FlexGlobals;
    import mx.events.FlexEvent;

    import spark.components.Button;
    import spark.components.SkinnableContainer;

    import ob.commands.SetClientInfoCommand;
    import ob.core.IObjectBuilder;
    import ob.hotkeys.HotkeyActions;
    import ob.hotkeys.HotkeyManager;

    import otlib.utils.ClientInfo;

    public class Toolbar extends SkinnableContainer
    {
        //--------------------------------------------------------------------------
        // PROPERTIES
        //--------------------------------------------------------------------------

        [SkinPart(required="true", type="spark.components.Button")]
        public var newButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var openButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var compileButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var compileAsButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var openFindWindowButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var openObjectViewerButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var openSlicerButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var openAnimationEditorButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var assetStoreButton:Button;

        [SkinPart(required="true", type="spark.components.Button")]
        public var openLogWindowButton:Button;

        private var m_application:IObjectBuilder;

        private var m_communicator:IWorkerCommunicator;
        private var m_hotkeys:HotkeyManager;

        //--------------------------------------
        // Getters / Setters
        //--------------------------------------

        public function get communicator():IWorkerCommunicator { return m_communicator; }
        public function set communicator(value:IWorkerCommunicator):void
        {
            if (m_communicator) {
                m_communicator.unregisterCallback(SetClientInfoCommand, clientInfoCallback);
                m_communicator = null;
            }

            m_communicator = value;

            if (m_communicator) {
                m_communicator.registerCallback(SetClientInfoCommand, clientInfoCallback);
            }
        }

        public function get hotkeyManager():HotkeyManager { return m_hotkeys; }
        public function set hotkeyManager(value:HotkeyManager):void
        {
            if (m_hotkeys == value)
                return;

            m_hotkeys = value;

            bindHotkeys();
        }

        //--------------------------------------------------------------------------
        // CONSTRUCTOR
        //--------------------------------------------------------------------------

        public function Toolbar()
        {
            addEventListener(FlexEvent.CREATION_COMPLETE, creationCompleteHandler);
        }

        //--------------------------------------------------------------------------
        // METHODS
        //--------------------------------------------------------------------------

        //--------------------------------------
        // Override Protected
        //--------------------------------------

        override protected function partAdded(partName:String, instance:Object):void
        {
            super.partAdded(partName, instance);

            if (instance == newButton ||
                instance == openButton ||
                instance == compileButton ||
                instance == compileAsButton ||
                instance == openFindWindowButton ||
                instance == openObjectViewerButton ||
                instance == openSlicerButton ||
                instance == openAnimationEditorButton ||
                instance == assetStoreButton ||
                instance == openLogWindowButton)
            {
                Button(instance).addEventListener(MouseEvent.CLICK, buttonClickHandler);
                if (m_hotkeys)
                    bindButtonHotkey(Button(instance));
            }
        }

        //--------------------------------------
        // Private
        //--------------------------------------

        private function clientInfoCallback(info:ClientInfo):void
        {
            openFindWindowButton.enabled = info.loaded;
            compileButton.enabled = (m_application.clientChanged && !m_application.clientIsTemporary);
            compileAsButton.enabled = m_application.clientLoaded;
            assetStoreButton.enabled = info.loaded;
        }

        private function bindHotkeys():void
        {
            if (!m_hotkeys)
                return;

            if (newButton)
                m_hotkeys.bindTooltip(newButton, HotkeyActions.FILE_NEW);
            if (openButton)
                m_hotkeys.bindTooltip(openButton, HotkeyActions.FILE_OPEN);
            if (compileButton)
                m_hotkeys.bindTooltip(compileButton, HotkeyActions.FILE_COMPILE);
            if (compileAsButton)
                m_hotkeys.bindTooltip(compileAsButton, HotkeyActions.FILE_COMPILE_AS);
            if (openFindWindowButton)
                m_hotkeys.bindTooltip(openFindWindowButton, HotkeyActions.TOOLS_FIND);
            if (openObjectViewerButton)
                m_hotkeys.bindTooltip(openObjectViewerButton, HotkeyActions.TOOLS_OBJECT_VIEWER);
            if (openSlicerButton)
                m_hotkeys.bindTooltip(openSlicerButton, HotkeyActions.TOOLS_SLICER);
            if (openAnimationEditorButton)
                m_hotkeys.bindTooltip(openAnimationEditorButton, HotkeyActions.TOOLS_ANIMATION_EDITOR);
            if (assetStoreButton)
                m_hotkeys.bindTooltip(assetStoreButton, HotkeyActions.ASSET_STORE);
            if (openLogWindowButton)
                m_hotkeys.bindTooltip(openLogWindowButton, HotkeyActions.WINDOW_LOG);
        }

        private function bindButtonHotkey(button:Button):void
        {
            if (!button || !m_hotkeys)
                return;

            switch (button)
            {
                case newButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.FILE_NEW);
                    break;
                case openButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.FILE_OPEN);
                    break;
                case compileButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.FILE_COMPILE);
                    break;
                case compileAsButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.FILE_COMPILE_AS);
                    break;
                case openFindWindowButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.TOOLS_FIND);
                    break;
                case openObjectViewerButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.TOOLS_OBJECT_VIEWER);
                    break;
                case openSlicerButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.TOOLS_SLICER);
                    break;
                case openAnimationEditorButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.TOOLS_ANIMATION_EDITOR);
                    break;
                case assetStoreButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.ASSET_STORE);
                    break;
                case openLogWindowButton:
                    m_hotkeys.bindTooltip(button, HotkeyActions.WINDOW_LOG);
                    break;
            }
        }

        //--------------------------------------
        // Event Handlers
        //--------------------------------------

        protected function creationCompleteHandler(event:FlexEvent):void
        {
            m_application = IObjectBuilder(FlexGlobals.topLevelApplication);
        }

        protected function buttonClickHandler(event:MouseEvent):void
        {
            switch (event.target)
            {
                case newButton:
                    m_application.createNewProject();
                    break;

                case openButton:
                    m_application.openProject();
                    break;

                case compileButton:
                    m_application.compileProject();
                    break;

                case compileAsButton:
                    m_application.compileProjectAs();
                    break;

                case openFindWindowButton:
                    m_application.openFinder();
                    break;

                case openObjectViewerButton:
                    m_application.openObjectViewer();
                    break;

                case openSlicerButton:
                    m_application.openSlicer();
                    break;

                case openAnimationEditorButton:
                    m_application.openAnimationEditor();
                    break;

                case assetStoreButton:
                    m_application.openAssetStore();
                    break;

                case openLogWindowButton:
                    m_application.openLogWindow();
                    break;
            }
        }
    }
}
