import { useState } from 'react';

// Primitives
import * as Dialog from '@/components/primitives/ui/dialog';
import * as Select from '@/components/primitives/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// API
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { useRoles } from '@/components/organizations/api/hooks';
import { useActiveOrganizationData, useActiveUserData } from '@/lib/auth/hooks';

// API Types
import { ConvexError } from 'convex/values';

/**
 * LeaveOrganization component allows a user to leave the current organization
 * If the user is the owner, they must select a successor before leaving
 */
export default function LeaveOrganization(): React.ReactNode {
	// State hooks
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedSuccessor, setSelectedSuccessor] = useState<string[]>([]);
	const [isLeaving, setIsLeaving] = useState<boolean>(false);

	// Convex queries and mutations
	const activeOrganization = useActiveOrganizationData();
	const activeUser = useActiveUserData();
	const members = activeOrganization?.members;
	const leaveOrganization = useMutation(api.organizations.members.mutations.leaveOrganization);

	// Navigation
	const router = useRouter();

	// Check if user is an organization owner
	const isOrgOwner = useRoles().hasOwnerRole;

	// Get organization members excluding current user for successor selection
	const organizationMembers =
		members?.filter(
			(member) =>
				// Don't include the current user
				member.userId !== activeUser?._id
		) || [];
	const successorCollection = Select.createListCollection({
		items: organizationMembers.map((member) => ({
			label: `${member.user.name} (${member.user.email})`,
			value: member.id
		}))
	});

	/**
	 * Validates form input before submission
	 */
	const validateForm = (): boolean => {
		if (isOrgOwner && selectedSuccessor.length === 0) {
			toast.error('As the organization owner, you must select a successor before leaving.');
			return false;
		}
		return true;
	};

	/**
	 * Handles the leave organization action
	 */
	const handleLeaveOrganization = async (): Promise<void> => {
		if (!validateForm()) return;

		if (!activeOrganization?.id) {
			toast.error('No active organization found.');
			return;
		}

		try {
			setIsLeaving(true);
			await leaveOrganization({
				// Only send successorId if the user is an owner and a successor is selected
				...(isOrgOwner && selectedSuccessor.length > 0
					? { successorMemberId: selectedSuccessor[0] }
					: {})
			});

			setIsOpen(false);
			toast.success('Successfully left the organization.');

			// Navigate to home page after leaving
			router.push('/');
		} catch (err) {
			toast.error(
				err instanceof ConvexError ? err.data : 'Failed to leave organization. Please try again.'
			);
			console.error(err);
		} finally {
			setIsLeaving(false);
		}
	};

	// Only show the component if there is an active organization with more than one member
	if (!activeOrganization || !members || members.length <= 1) {
		return null;
	}

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dialog.Trigger className="btn btn-sm preset-faded-surface-50-950 text-surface-600-400 hover:bg-error-300-700 hover:text-error-950-50 w-fit justify-between gap-1 text-sm">
				Leave organization
			</Dialog.Trigger>

			<Dialog.Content className="md:max-w-108">
				<Dialog.Header>
					<Dialog.Title>Leave organization</Dialog.Title>
				</Dialog.Header>
				<Dialog.Description className="flex flex-col gap-2">
					<span>
						If you leave organization you&apos;ll lose access to all projects and resources.
					</span>
					{isOrgOwner && (
						<span className="my-2">As the owner, you must assign a new owner before leaving.</span>
					)}
				</Dialog.Description>
				{isOrgOwner && (
					<>
						<div className="w-full space-y-2">
							<label htmlFor="successor" className="label">
								New owner:
							</label>
							<Select.Root
								collection={successorCollection}
								value={selectedSuccessor}
								onValueChange={(details) => setSelectedSuccessor(details.value)}
							>
								<Select.Trigger
									id="successor"
									className="w-full"
									placeholder="Choose a successor"
								/>
								<Select.Content>
									{successorCollection.items.map((item) => (
										<Select.Item key={item.value} item={item}>
											<Select.ItemText>{item.label}</Select.ItemText>
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</div>
					</>
				)}

				<Dialog.Footer>
					<button
						className="btn preset-tonal"
						onClick={() => setIsOpen(false)}
						disabled={isLeaving}
					>
						Cancel
					</button>
					<button
						type="button"
						className="btn bg-error-500 hover:bg-error-600 text-white"
						onClick={handleLeaveOrganization}
						disabled={isLeaving || (isOrgOwner && selectedSuccessor.length === 0)}
						aria-busy={isLeaving}
					>
						{isLeaving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
								Leaving...
							</>
						) : (
							'Confirm'
						)}
					</button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	);
}
