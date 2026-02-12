import { useState } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { Settings } from "../types/github";

interface SettingsViewProps {
	settings: Settings;
	onSave: (settings: Settings) => Promise<void>;
	onBack?: () => void;
	isInitialSetup?: boolean;
	onToggleDarkMode: () => void;
}

async function resolveGitHubUsername(token: string): Promise<string> {
	const res = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github.v3+json",
		},
	});
	if (!res.ok) {
		throw new Error("Token GitHub invalide ou expire.");
	}
	const data = await res.json();
	return data.login;
}

async function validateExpoToken(token: string): Promise<void> {
	const res = await fetch("https://api.expo.dev/graphql", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ query: "{ viewer { id } }" }),
	});
	if (!res.ok) {
		throw new Error("Token Expo invalide ou expire.");
	}
	const json = await res.json();
	if (json.errors?.length) {
		throw new Error("Token Expo invalide ou expire.");
	}
}

function clampPolling(value: number): number {
	return Math.max(1, Math.min(60, Math.round(value) || 5));
}

export function SettingsView({
	settings,
	onSave,
	onBack,
	isInitialSetup = false,
	onToggleDarkMode,
}: SettingsViewProps) {
	const [form, setForm] = useState<Settings>({ ...settings });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.token.trim()) {
			setError("Le token GitHub est requis.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const username = await resolveGitHubUsername(form.token.trim());

			if (form.expoToken.trim() && form.expoProjectSlug.trim()) {
				await validateExpoToken(form.expoToken.trim());
			}

			const clamped = {
				...form,
				username,
				pollingInterval: clampPolling(form.pollingInterval),
			};
			await onSave(clamped);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Erreur lors de la sauvegarde.",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center gap-2 px-4 pt-3 pb-1">
				{!isInitialSetup && onBack && (
					<button
						type="button"
						onClick={onBack}
						className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all cursor-pointer"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
				)}
				<div className="flex items-center gap-2.5">
					<svg
						className="w-6 h-6 text-[var(--text-primary)]"
						viewBox="0 -3.1 2490.3 2493"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="m1245.2 1.6c-687.6 0-1245.2 557.4-1245.2 1245.1 0 550.2 356.8 1016.9 851.5 1181.5 62.2 11.5 85.1-27 85.1-59.9 0-29.7-1.2-127.8-1.7-231.8-346.4 75.3-419.5-146.9-419.5-146.9-56.6-143.9-138.3-182.2-138.3-182.2-113-77.3 8.5-75.7 8.5-75.7 125 8.8 190.9 128.3 190.9 128.3 111.1 190.4 291.3 135.3 362.3 103.5 11.2-80.5 43.4-135.4 79.1-166.5-276.6-31.5-567.3-138.3-567.3-615.4 0-135.9 48.6-247 128.3-334.2-12.9-31.3-55.5-157.9 12.1-329.4 0 0 104.6-33.5 342.5 127.6 99.3-27.6 205.8-41.4 311.7-41.9 105.8.5 212.4 14.3 311.9 41.9 237.7-161.1 342.1-127.6 342.1-127.6 67.8 171.5 25.1 298.2 12.2 329.5 79.8 87.2 128.1 198.3 128.1 334.2 0 478.2-291.3 583.6-568.6 614.4 44.7 38.6 84.5 114.4 84.5 230.6 0 166.6-1.4 300.7-1.4 341.7 0 33.1 22.4 72 85.5 59.7 494.5-164.8 850.8-631.4 850.8-1181.4 0-687.7-557.5-1245.1-1245.1-1245.1"
							fill="currentColor"
						/>
					</svg>
					<span className="text-[13px] font-semibold text-[var(--text-primary)]">
						{isInitialSetup ? "Bienvenue sur skyLab" : "Parametres"}
					</span>
				</div>
			</div>

			{isInitialSetup && (
				<p className="px-4 pt-2 text-[13px] text-[var(--text-tertiary)]">
					Configure ton acces GitHub pour commencer a suivre tes PRs.
				</p>
			)}

			<form
				onSubmit={handleSubmit}
				className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4"
			>
				<div>
					<label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
						Personal Access Token
					</label>
					<input
						type="password"
						value={form.token}
						onChange={(e) =>
							setForm({ ...form, token: e.target.value })
						}
						placeholder="ghp_..."
						className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-lg px-3 py-2.5 text-[14px] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
					/>
					{isInitialSetup ? (
						<button
							type="button"
							onClick={() => openUrl("https://github.com/settings/tokens/new?scopes=repo&description=skyLab")}
							className="text-[11px] text-[var(--accent)] hover:underline mt-1.5 cursor-pointer"
						>
							Generer un token sur GitHub &rarr;
						</button>
					) : (
						<p className="text-[11px] text-[var(--text-tertiary)] mt-1.5">
							Settings &rarr; Developer settings &rarr; Personal
							access tokens (scope: repo)
						</p>
					)}
				</div>

				<div>
					<label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
						Intervalle de polling
					</label>
					<div className="flex items-center gap-2">
						<input
							type="number"
							min={1}
							max={60}
							value={form.pollingInterval}
							onChange={(e) =>
								setForm({
									...form,
									pollingInterval: clampPolling(
										Number(e.target.value),
									),
								})
							}
							className="w-20 bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] transition-colors"
						/>
						<span className="text-[13px] text-[var(--text-tertiary)]">
							minutes
						</span>
					</div>
					{form.pollingInterval <= 1 && (
						<p className="text-[11px] text-[var(--aging)] mt-1.5">
							A 1 min, tu consommes ~2500 req/h sur les 5000
							autorisees par GitHub.
						</p>
					)}
				</div>

				<div className="flex items-center justify-between">
					<div>
						<label className="block text-[12px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
							Dark mode
						</label>
						<p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
							Apparence sombre de l'interface
						</p>
					</div>
					<button
						type="button"
						onClick={onToggleDarkMode}
						className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${settings.darkMode ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)] border border-[var(--border-strong)]"}`}
					>
						<span
							className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.darkMode ? "translate-x-4" : "translate-x-0"}`}
						/>
					</button>
				</div>

				<div>
					<label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
						Affichage
					</label>
					<div className="space-y-2">
						<label className="flex items-center gap-2.5 cursor-pointer">
							<input
								type="checkbox"
								checked={form.showNotionLink}
								onChange={(e) =>
									setForm({
										...form,
										showNotionLink: e.target.checked,
									})
								}
								className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
							/>
							<span className="text-[13px] text-[var(--text-primary)]">
								Lien Notion de la PR
							</span>
						</label>
						<label className="flex items-center gap-2.5 cursor-pointer">
							<input
								type="checkbox"
								checked={form.showCopyButton}
								onChange={(e) =>
									setForm({
										...form,
										showCopyButton: e.target.checked,
									})
								}
								className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
							/>
							<span className="text-[13px] text-[var(--text-primary)]">
								Bouton copier le lien
							</span>
						</label>
						<label className="flex items-center gap-2.5 cursor-pointer">
							<input
								type="checkbox"
								checked={form.showCIBadge}
								onChange={(e) =>
									setForm({
										...form,
										showCIBadge: e.target.checked,
									})
								}
								className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
							/>
							<span className="text-[13px] text-[var(--text-primary)]">
								Badge statut CI
							</span>
						</label>
					</div>
				</div>

				{/* Separator */}

				<div className="border-t border-[var(--border-strong)] pt-4">
					{isInitialSetup && (
						<p className="py-3 text-[13px] text-[var(--text-tertiary)]">
							Configure ton acces EXPO pour voir tes builds  🤖
						</p>
					)}
					<label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
						Expo / EAS
					</label>

					<div className="space-y-3">
						<div>
							<label className="block text-[11px] text-[var(--text-tertiary)] mb-1">
								Expo Access Token
							</label>
							<input
								type="password"
								value={form.expoToken}
								onChange={(e) =>
									setForm({
										...form,
										expoToken: e.target.value,
									})
								}
								placeholder="expo_..."
								className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-lg px-3 py-2.5 text-[14px] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
							/>
							{isInitialSetup ? (
								<button
									type="button"
									onClick={() => openUrl("https://expo.dev/accounts/[account]/settings/access-tokens")}
									className="text-[11px] text-[var(--accent)] hover:underline mt-1 cursor-pointer"
								>
									Generer un token sur Expo &rarr;
								</button>
							) : (
								<p className="text-[11px] text-[var(--text-tertiary)] mt-1">
									expo.dev &rarr; Account Settings &rarr;
									Access Tokens
								</p>
							)}
						</div>

						<div>
							<label className="block text-[11px] text-[var(--text-tertiary)] mb-1">
								Project slug
							</label>
							<input
								type="text"
								value={form.expoProjectSlug}
								onChange={(e) =>
									setForm({
										...form,
										expoProjectSlug: e.target.value,
									})
								}
								placeholder="account/project"
								className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-lg px-3 py-2.5 text-[14px] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
							/>
						</div>
					</div>
				</div>

				{error && (
					<p className="text-[12px] text-[var(--stale)]">{error}</p>
				)}

				<button
					type="submit"
					disabled={saving}
					className="w-full bg-[var(--accent)] text-white font-medium text-[14px] py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
				>
					{saving ? "Validation..." : "Sauvegarder"}
				</button>
			</form>
		</div>
	);
}
