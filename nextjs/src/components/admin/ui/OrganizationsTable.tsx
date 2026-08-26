'use client';

import { useState } from 'react';
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
import { toast } from 'sonner';
import { Trash, Users } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import * as Avatar from '@/components/primitives/ui/avatar';
import * as Dialog from '@/components/primitives/ui/dialog';

type OrgRow = {
	_id: string;
	name: string;
	slug: string;
	logo?: string | null;
};

/**
 * Admin organizations management table. Lists every organization in the
 * deployment with a members view and force-delete. Only mounted when the
 * `organizations` feature toggle is enabled (enforced by {@link AdminDashboard}
 * and the server functions).
 */
export default function OrganizationsTable() {
	const { results, status, loadMore } = usePaginatedQuery(
		api.admin.queries.listAllOrganizations,
		{},
		{ initialNumItems: 25 }
	);
	const organizations = (results ?? []) as OrgRow[];

	const deleteOrganization = useMutation(api.admin.mutations.deleteOrganizationAsAdmin);

	const [selectedOrg, setSelectedOrg] = useState<OrgRow | null>(null);
	const [membersOpen, setMembersOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const orgDetail = useQuery(
		api.admin.queries.getOrganizationWithMembers,
		membersOpen && selectedOrg ? { organizationId: selectedOrg._id } : 'skip'
	);

	async function handleDelete() {
		if (!selectedOrg) return;
		try {
			await deleteOrganization({ organizationId: selectedOrg._id });
			toast.success('Organization deleted');
			setDeleteOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to delete organization');
		}
	}

	return (
		<div className="flex h-full flex-col py-4">
			{status === 'LoadingFirstPage' ? (
				<div className="p-4 text-sm opacity-60">Loading organizations...</div>
			) : organizations.length === 0 ? (
				<div className="p-4 text-sm opacity-60">No organizations found.</div>
			) : (
				<div className="max-h-[calc(80vh-12rem)] overflow-y-auto pb-12">
					<table className="table w-full">
						<thead className="sticky top-0 z-20">
							<tr>
								<th className="text-surface-600-400 p-2 !pl-3 text-left text-xs font-semibold">
									Name
								</th>
								<th className="text-surface-600-400 hidden p-2 text-left text-xs sm:table-cell">
									Slug
								</th>
								<th className="!w-24 p-2 text-right"></th>
							</tr>
						</thead>
						<tbody>
							{organizations.map((org) => (
								<tr key={org._id} className="!border-surface-300-700 !border-t">
									<td className="!py-3 !pl-3">
										<div className="flex items-center space-x-2">
											<Avatar.Root className="size-8 sm:size-6">
												<Avatar.Image src={org.logo ?? undefined} alt={org.name} />
												<Avatar.Fallback>
													<Avatar.Marble name={org.name} />
												</Avatar.Fallback>
											</Avatar.Root>
											<span className="truncate text-sm">{org.name}</span>
										</div>
									</td>
									<td className="!text-surface-600-400 hidden !truncate text-sm sm:table-cell">
										{org.slug}
									</td>
									<td className="!w-24">
										<div className="flex justify-end gap-1">
											<button
												type="button"
												title="View members"
												className="btn-icon preset-filled-surface-200-800"
												onClick={() => {
													setSelectedOrg(org);
													setMembersOpen(true);
												}}
											>
												<Users className="size-4 opacity-70" />
											</button>
											<button
												type="button"
												title="Delete organization"
												className="btn-icon preset-filled-surface-200-800 hover:preset-filled-error-300-700"
												onClick={() => {
													setSelectedOrg(org);
													setDeleteOpen(true);
												}}
											>
												<Trash className="size-4 opacity-70" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{status === 'CanLoadMore' ? (
						<div className="flex justify-center py-3">
							<button type="button" className="btn preset-tonal" onClick={() => loadMore(25)}>
								Load more
							</button>
						</div>
					) : null}
				</div>
			)}

			{/* Members dialog */}
			<Dialog.Root open={membersOpen} onOpenChange={setMembersOpen}>
				<Dialog.Content className="md:max-w-108">
					<Dialog.Header>
						<Dialog.Title>{selectedOrg?.name} members</Dialog.Title>
					</Dialog.Header>
					<div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
						{!orgDetail ? (
							<div className="text-sm opacity-60">Loading members...</div>
						) : orgDetail.members.length === 0 ? (
							<div className="text-sm opacity-60">No members.</div>
						) : (
							orgDetail.members.map((member) => (
								<div key={member._id} className="flex items-center gap-3">
									<Avatar.Root className="size-8">
										<Avatar.Image
											src={member.user?.image ?? undefined}
											alt={member.user?.name ?? ''}
										/>
										<Avatar.Fallback>
											<Avatar.Marble name={member.user?.name ?? '?'} />
										</Avatar.Fallback>
									</Avatar.Root>
									<div className="flex flex-1 flex-col truncate">
										<span className="truncate text-sm">{member.user?.name ?? 'Unknown user'}</span>
										<span className="text-surface-700-300 truncate text-xs">
											{member.user?.email}
										</span>
									</div>
									<span className="badge preset-filled-surface-300-700 h-6 px-2 text-xs">
										{member.role}
									</span>
								</div>
							))
						)}
					</div>
				</Dialog.Content>
			</Dialog.Root>

			{/* Delete dialog */}
			<Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
				<Dialog.Content className="md:max-w-108">
					<Dialog.Header>
						<Dialog.Title>Delete organization</Dialog.Title>
					</Dialog.Header>
					<Dialog.Description>
						Are you sure you want to permanently delete {selectedOrg?.name}? All members and
						invitations will be removed. This cannot be undone.
					</Dialog.Description>
					<Dialog.Footer>
						<button type="button" className="btn preset-tonal" onClick={() => setDeleteOpen(false)}>
							Cancel
						</button>
						<button type="button" className="btn preset-filled-error-500" onClick={handleDelete}>
							Delete
						</button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	);
}
