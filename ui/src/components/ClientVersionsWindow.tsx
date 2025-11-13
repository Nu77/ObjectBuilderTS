import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import { Button } from './Button';
import './ClientVersionsWindow.css';

interface Version {
	value: number;
	valueStr: string;
	datSignature: number;
	sprSignature: number;
	otbVersion: number;
}

interface ClientVersionsWindowProps {
	onClose?: () => void;
}

export const ClientVersionsWindow: React.FC<ClientVersionsWindowProps> = ({ onClose }) => {
	const { showError, showSuccess } = useToast();
	const [versions, setVersions] = useState<Version[]>([]);
	const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
	const [versionValue, setVersionValue] = useState<string>('');
	const [datSignature, setDatSignature] = useState<string>('');
	const [sprSignature, setSprSignature] = useState<string>('');
	const [otbVersion, setOtbVersion] = useState<number>(0);
	const [canAdd, setCanAdd] = useState<boolean>(false);
	const [canRemove, setCanRemove] = useState<boolean>(false);

	const electronAPI = (window as any).electronAPI;

	// Load versions
	const loadVersions = useCallback(async () => {
		try {
			if (electronAPI && electronAPI.getVersions) {
				const result = await electronAPI.getVersions();
				if (result.success) {
					setVersions(result.versions || []);
				} else {
					showError(result.error || 'Failed to load versions');
				}
			}
		} catch (error: any) {
			showError(error.message || 'Failed to load versions');
		}
	}, [electronAPI, showError]);

	useEffect(() => {
		loadVersions();
	}, [loadVersions]);

	// Check if version can be added/removed
	useEffect(() => {
		if (!versionValue || !datSignature || !sprSignature) {
			setCanAdd(false);
			return;
		}

		// Parse version value (e.g., "10.41" -> 1041)
		const versionValueText = versionValue.replace(/\./g, '');
		const value = parseInt(versionValueText, 10);
		if (value < 710) {
			setCanAdd(false);
			return;
		}

		// Parse signatures (hex)
		if (datSignature.length !== 8 || sprSignature.length !== 8) {
			setCanAdd(false);
			return;
		}

		const datSig = parseInt(datSignature, 16);
		const sprSig = parseInt(sprSignature, 16);

		// Check if version already exists
		const existing = versions.find(v => 
			v.datSignature === datSig && 
			v.sprSignature === sprSig && 
			v.otbVersion === otbVersion
		);

		if (existing && existing.value === value) {
			setCanAdd(false);
			setCanRemove(true);
		} else {
			setCanAdd(true);
			setCanRemove(false);
		}
	}, [versionValue, datSignature, sprSignature, otbVersion, versions]);

	// Handle version selection
	const handleVersionSelect = useCallback((version: Version) => {
		setSelectedVersion(version);
		setVersionValue(version.valueStr);
		setDatSignature(version.datSignature.toString(16).toUpperCase().padStart(8, '0'));
		setSprSignature(version.sprSignature.toString(16).toUpperCase().padStart(8, '0'));
		setOtbVersion(version.otbVersion);
		setCanRemove(true);
	}, []);

	// Add version
	const handleAddVersion = useCallback(async () => {
		if (!canAdd) return;

		try {
			const versionValueText = versionValue.replace(/\./g, '');
			const value = parseInt(versionValueText, 10);
			const datSig = parseInt(datSignature, 16);
			const sprSig = parseInt(sprSignature, 16);

			if (electronAPI && electronAPI.addVersion) {
				const result = await electronAPI.addVersion(value, datSig, sprSig, otbVersion);
				if (result.success) {
					showSuccess('Version added successfully');
					await loadVersions();
					// Clear form
					setVersionValue('');
					setDatSignature('');
					setSprSignature('');
					setOtbVersion(0);
					setSelectedVersion(null);
				} else {
					showError(result.error || 'Failed to add version');
				}
			}
		} catch (error: any) {
			showError(error.message || 'Failed to add version');
		}
	}, [canAdd, versionValue, datSignature, sprSignature, otbVersion, electronAPI, showSuccess, showError, loadVersions]);

	// Remove version
	const handleRemoveVersion = useCallback(async () => {
		if (!selectedVersion) return;

		const confirmed = window.confirm(
			`Are you sure you want to remove version ${selectedVersion.valueStr}?`
		);

		if (!confirmed) return;

		try {
			if (electronAPI && electronAPI.removeVersion) {
				const result = await electronAPI.removeVersion(selectedVersion.valueStr);
				if (result.success) {
					showSuccess('Version removed successfully');
					await loadVersions();
					// Clear form
					setVersionValue('');
					setDatSignature('');
					setSprSignature('');
					setOtbVersion(0);
					setSelectedVersion(null);
				} else {
					showError(result.error || 'Failed to remove version');
				}
			}
		} catch (error: any) {
			showError(error.message || 'Failed to remove version');
		}
	}, [selectedVersion, electronAPI, showSuccess, showError, loadVersions]);

	return (
		<div className="client-versions-window-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
			<div className="client-versions-window" onClick={(e) => e.stopPropagation()}>
				<div className="client-versions-header">
					<h2>Client Versions</h2>
					<button className="close-button" onClick={onClose}>×</button>
				</div>

				<div className="client-versions-content">
					{/* Versions List */}
					<div className="versions-list-container">
						<table className="versions-table">
							<thead>
								<tr>
									<th>Value</th>
									<th>String</th>
									<th>Dat</th>
									<th>Spr</th>
									<th>Otb</th>
								</tr>
							</thead>
							<tbody>
								{versions.map((version, index) => (
									<tr
										key={index}
										className={selectedVersion === version ? 'selected' : ''}
										onClick={() => handleVersionSelect(version)}
									>
										<td>{version.value}</td>
										<td>{version.valueStr}</td>
										<td>{version.datSignature.toString(16).toUpperCase().padStart(8, '0')}</td>
										<td>{version.sprSignature.toString(16).toUpperCase().padStart(8, '0')}</td>
										<td>{version.otbVersion}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Controls */}
					<div className="versions-controls">
						<div className="control-buttons">
							<Button
								onClick={handleAddVersion}
								disabled={!canAdd}
								title="Add Version"
							>
								+
							</Button>
							<Button
								onClick={handleRemoveVersion}
								disabled={!canRemove}
								title="Remove Version"
							>
								−
							</Button>
						</div>

						<div className="version-inputs">
							<div className="input-group">
								<label>Value:</label>
								<select
									value={versionValue}
									onChange={(e) => {
										setVersionValue(e.target.value);
										const version = versions.find(v => v.valueStr === e.target.value);
										if (version) {
											handleVersionSelect(version);
										}
									}}
								>
									<option value="">Select...</option>
									{versions.map(v => (
										<option key={v.valueStr} value={v.valueStr}>{v.valueStr}</option>
									))}
								</select>
							</div>

							<div className="input-group">
								<label>Dat:</label>
								<input
									type="text"
									value={datSignature}
									onChange={(e) => {
										const val = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 8);
										setDatSignature(val);
									}}
									placeholder="00000000"
									maxLength={8}
								/>
							</div>

							<div className="input-group">
								<label>Spr:</label>
								<input
									type="text"
									value={sprSignature}
									onChange={(e) => {
										const val = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 8);
										setSprSignature(val);
									}}
									placeholder="00000000"
									maxLength={8}
								/>
							</div>

							<div className="input-group">
								<label>Otb:</label>
								<input
									type="number"
									value={otbVersion}
									onChange={(e) => setOtbVersion(parseInt(e.target.value, 10) || 0)}
									min={0}
									max={1000}
								/>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="versions-footer">
						<Button onClick={onClose}>Close</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

