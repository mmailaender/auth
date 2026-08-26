'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { KeyRound, LogIn, LogOut, Search, ShieldBan, ShieldCheck, Trash } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import * as Avatar from '@/components/primitives/ui/avatar';
import * as Dialog from '@/components/primitives/ui/dialog';
import { authClient } from '@/lib/auth/api/auth-client';
import { useActiveUserData } from '@/lib/auth/hooks';
import CreateUser from '@/components/admin/ui/CreateUser';

type AdminUserRow = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	role?: string | null;
	banned?: boolean | null;
};

/**
 * Admin users management table. Lists every user with search, role management,
 * ban/unban, password reset, impersonation and deletion. All privileged calls go
 * through admin-gated Convex functions (impersonation goes through the Better
 * Auth client directly, since it manipulates the session).
 */
export default function UsersTable() {
	const activeUser = useActiveUserData();
	const [searchQuery, setSearchQuery] = useState('');
	const [limit, setLimit] = useState(50);

	const result = useQuery(api.admin.queries.listUsers, {
		searchValue: searchQuery || undefined,
		limit
	});
	const users = (result?.users ?? []) as AdminUserRow[];
	const total = result?.total ?? 0;

	// Mutations
	const setRole = useMutation(api.admin.mutations.setRole);
	const banUser = useMutation(api.admin.mutations.banUser);
	const unbanUser = useMutation(api.admin.mutations.unbanUser);
	const removeUser = useMutation(api.admin.mutations.removeUser);
	const setUserPassword = useMutation(api.admin.mutations.setUserPassword);
	const revokeUserSessions = useMutation(api.admin.mutations.revokeUserSessions);

	// Dialog state
	const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
	const [banDialogOpen, setBanDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
	const [banReason, setBanReason] = useState('');
	const [banExpiresIn, setBanExpiresIn] = useState('');
	const [newPassword, setNewPassword] = useState('');

	const isSelf = (user: AdminUserRow) => user.id === activeUser?._id;

	async function handleRoleChange(user: AdminUserRow, role: string) {
		try {
			await setRole({ userId: user.id, role });
			toast.success('Role updated');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update role');
		}
	}

	async function handleUnban(user: AdminUserRow) {
		try {
			await unbanUser({ userId: user.id });
			toast.success('User unbanned');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to unban user');
		}
	}

	async function handleBanSubmit() {
		if (!selectedUser) return;
		try {
			await banUser({
				userId: selectedUser.id,
				banReason: banReason || undefined,
				banExpiresIn: banExpiresIn ? Number(banExpiresIn) : undefined
			});
			toast.success('User banned');
			setBanDialogOpen(false);
			setBanReason('');
			setBanExpiresIn('');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to ban user');
		}
	}

	async function handleDeleteSubmit() {
		if (!selectedUser) return;
		try {
			await removeUser({ userId: selectedUser.id });
			toast.success('User deleted');
			setDeleteDialogOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to delete user');
		}
	}

	async function handlePasswordSubmit() {
		if (!selectedUser) return;
		try {
			await setUserPassword({ userId: selectedUser.id, newPassword });
			toast.success('Password updated');
			setPasswordDialogOpen(false);
			setNewPassword('');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to set password');
		}
	}

	async function handleRevokeSessions(user: AdminUserRow) {
		try {
			await revokeUserSessions({ userId: user.id });
			toast.success(`Signed ${user.name} out everywhere`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to revoke sessions');
		}
	}

	async function handleImpersonate(user: AdminUserRow) {
		const { error } = await authClient.admin.impersonateUser({ userId: user.id });
		if (error) {
			toast.error(error.message ?? 'Failed to impersonate user');
			return;
		}
		toast.success(`Impersonating ${user.name}`);
		window.location.href = '/';
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex flex-shrink-0 items-center gap-3 py-4">
				<div className="relative flex-1">
					<div className="pointer-events-none absolute inset-y-0 flex items-center">
						<Search className="text-surface-400-600 size-4" />
					</div>
					<input
						type="text"
						className="input w-full !border-0 border-transparent pl-6 text-sm"
						placeholder="Search users..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<CreateUser />
			</div>

			{!result ? (
				<div className="p-4 text-sm opacity-60">Loading users...</div>
			) : users.length === 0 ? (
				<div className="p-4 text-sm opacity-60">No users found.</div>
			) : (
				<div className="max-h-[calc(80vh-12rem)] overflow-y-auto pb-12">
					<table className="table w-full">
						<thead className="sticky top-0 z-20">
							<tr>
								<th className="text-surface-600-400 p-2 !pl-3 text-left text-xs font-semibold">
									Name
								</th>
								<th className="text-surface-600-400 hidden p-2 text-left text-xs sm:table-cell">
									Email
								</th>
								<th className="text-surface-600-400 !w-32 p-2 text-left text-xs">Role</th>
								<th className="!w-32 p-2 text-right"></th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id} className="!border-surface-300-700 !border-t">
									<td className="!py-3 !pl-3">
										<div className="flex items-center space-x-2">
											<Avatar.Root className="size-8 sm:size-6">
												<Avatar.Image src={user.image ?? undefined} alt={user.name} />
												<Avatar.Fallback>
													<Avatar.Marble name={user.name} />
												</Avatar.Fallback>
											</Avatar.Root>
											<div className="flex flex-col truncate">
												<span className="truncate text-sm">
													{user.name}
													{user.banned ? (
														<span className="badge preset-filled-error-50-950 border-error-200-800 ml-2 h-5 border px-2">
															Banned
														</span>
													) : null}
												</span>
												<span className="text-surface-700-300 truncate text-xs sm:hidden">
													{user.email}
												</span>
											</div>
										</div>
									</td>
									<td className="!text-surface-600-400 hidden !truncate text-sm sm:table-cell">
										{user.email}
									</td>
									<td className="!w-32">
										{isSelf(user) ? (
											<span className="badge preset-filled-warning-50-950 border-warning-200-800 h-7 border px-2">
												{user.role ?? 'user'}
											</span>
										) : (
											<select
												value={(user.role ?? 'user').includes('admin') ? 'admin' : 'user'}
												onChange={(e) => handleRoleChange(user, e.target.value)}
												className="select cursor-pointer text-sm"
											>
												<option value="user">User</option>
												<option value="admin">Admin</option>
											</select>
										)}
									</td>
									<td className="!w-32">
										<div className="flex justify-end gap-1">
											{!isSelf(user) && (
												<>
													<button
														type="button"
														title="Impersonate"
														className="btn-icon preset-filled-surface-200-800 hover:preset-filled-primary-300-700"
														onClick={() => handleImpersonate(user)}
													>
														<LogIn className="size-4 opacity-70" />
													</button>
													<button
														type="button"
														title="Set password"
														className="btn-icon preset-filled-surface-200-800"
														onClick={() => {
															setSelectedUser(user);
															setPasswordDialogOpen(true);
														}}
													>
														<KeyRound className="size-4 opacity-70" />
													</button>
													<button
														type="button"
														title="Revoke sessions"
														className="btn-icon preset-filled-surface-200-800"
														onClick={() => handleRevokeSessions(user)}
													>
														<LogOut className="size-4 opacity-70" />
													</button>
													{user.banned ? (
														<button
															type="button"
															title="Unban"
															className="btn-icon preset-filled-surface-200-800 hover:preset-filled-success-300-700"
															onClick={() => handleUnban(user)}
														>
															<ShieldCheck className="size-4 opacity-70" />
														</button>
													) : (
														<button
															type="button"
															title="Ban"
															className="btn-icon preset-filled-surface-200-800 hover:preset-filled-warning-300-700"
															onClick={() => {
																setSelectedUser(user);
																setBanDialogOpen(true);
															}}
														>
															<ShieldBan className="size-4 opacity-70" />
														</button>
													)}
													<button
														type="button"
														title="Delete"
														className="btn-icon preset-filled-surface-200-800 hover:preset-filled-error-300-700"
														onClick={() => {
															setSelectedUser(user);
															setDeleteDialogOpen(true);
														}}
													>
														<Trash className="size-4 opacity-70" />
													</button>
												</>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{users.length < total ? (
						<div className="flex justify-center py-3">
							<button
								type="button"
								className="btn preset-tonal"
								onClick={() => setLimit(limit + 50)}
							>
								Load more
							</button>
						</div>
					) : null}
				</div>
			)}

			{/* Ban dialog */}
			<Dialog.Root open={banDialogOpen} onOpenChange={setBanDialogOpen}>
				<Dialog.Content className="md:max-w-108">
					<Dialog.Header>
						<Dialog.Title>Ban {selectedUser?.name}</Dialog.Title>
					</Dialog.Header>
					<div className="flex flex-col gap-3">
						<label className="label">
							<span>Reason (optional)</span>
							<input
								type="text"
								className="input"
								value={banReason}
								onChange={(e) => setBanReason(e.target.value)}
								placeholder="Violation of terms"
							/>
						</label>
						<label className="label">
							<span>Duration</span>
							<select
								className="select"
								value={banExpiresIn}
								onChange={(e) => setBanExpiresIn(e.target.value)}
							>
								<option value="">Permanent</option>
								<option value={String(60 * 60 * 24)}>1 day</option>
								<option value={String(60 * 60 * 24 * 7)}>7 days</option>
								<option value={String(60 * 60 * 24 * 30)}>30 days</option>
							</select>
						</label>
					</div>
					<Dialog.Footer>
						<button
							type="button"
							className="btn preset-tonal"
							onClick={() => setBanDialogOpen(false)}
						>
							Cancel
						</button>
						<button
							type="button"
							className="btn preset-filled-warning-500"
							onClick={handleBanSubmit}
						>
							Ban user
						</button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>

			{/* Set password dialog */}
			<Dialog.Root open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
				<Dialog.Content className="md:max-w-108">
					<Dialog.Header>
						<Dialog.Title>Set password for {selectedUser?.name}</Dialog.Title>
					</Dialog.Header>
					<label className="label">
						<span>New password</span>
						<input
							type="password"
							className="input"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
					</label>
					<Dialog.Footer>
						<button
							type="button"
							className="btn preset-tonal"
							onClick={() => setPasswordDialogOpen(false)}
						>
							Cancel
						</button>
						<button
							type="button"
							className="btn preset-filled-primary-500"
							onClick={handlePasswordSubmit}
							disabled={!newPassword}
						>
							Save
						</button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>

			{/* Delete dialog */}
			<Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<Dialog.Content className="md:max-w-108">
					<Dialog.Header>
						<Dialog.Title>Delete user</Dialog.Title>
					</Dialog.Header>
					<Dialog.Description>
						Are you sure you want to permanently delete {selectedUser?.name}? This cannot be undone.
					</Dialog.Description>
					<Dialog.Footer>
						<button
							type="button"
							className="btn preset-tonal"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</button>
						<button
							type="button"
							className="btn preset-filled-error-500"
							onClick={handleDeleteSubmit}
						>
							Delete
						</button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	);
}
