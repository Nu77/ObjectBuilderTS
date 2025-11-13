import React from 'react';
import { Button } from '../Button';
import './AnimationEditorToolbar.css';

interface AnimationEditorToolbarProps {
	onOpenFile: () => void;
	onSave: () => void;
	onPaste: () => void;
	onRotateLeft: () => void;
	onRotateRight: () => void;
	onFlipHorizontal: () => void;
	onFlipVertical: () => void;
	hasImage: boolean;
	canSave: boolean;
}

export const AnimationEditorToolbar: React.FC<AnimationEditorToolbarProps> = ({
	onOpenFile,
	onSave,
	onPaste,
	onRotateLeft,
	onRotateRight,
	onFlipHorizontal,
	onFlipVertical,
	hasImage,
	canSave,
}) => {
	return (
		<div className="animation-editor-toolbar">
			<div className="toolbar-group">
				<Button onClick={onOpenFile} title="Open File (Ctrl+O)">
					Open
				</Button>
				<Button onClick={onSave} disabled={!canSave} title="Save Animation (Ctrl+S)">
					Save
				</Button>
			</div>
			<div className="toolbar-group">
				<Button onClick={onPaste} title="Paste from Clipboard (Ctrl+V)">
					Paste
				</Button>
			</div>
			<div className="toolbar-group">
				<Button onClick={onRotateLeft} disabled={!hasImage} title="Rotate Left 90°">
					↺
				</Button>
				<Button onClick={onRotateRight} disabled={!hasImage} title="Rotate Right 90°">
					↻
				</Button>
				<Button onClick={onFlipHorizontal} disabled={!hasImage} title="Flip Horizontal">
					⇄
				</Button>
				<Button onClick={onFlipVertical} disabled={!hasImage} title="Flip Vertical">
					⇅
				</Button>
			</div>
		</div>
	);
};

