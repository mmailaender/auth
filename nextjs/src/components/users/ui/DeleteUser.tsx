'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import * as Dialog from '@/components/primitives/ui/dialog';
import { requestCloseUserProfile } from '@/components/users/utils/userProfile';
import { api } from '@/convex/_generated/api';
import { authClient } from '@/lib/auth/api/auth-client';

export default function DeleteUser() {
	const deleteUser = useMutation(api.users.mutations.deleteUser);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	async function handleConfirm() {
		setIsDeleting(true);
		try {
			await deleteUser({});
		} catch (error) {
			if (error instanceof ConvexError) toast.error(error.data);
			else if (error instanceof Error) toast.error(error.message);
			else toast.error('Failed to delete user');
			setIsDeleting(false);
			return;
		}

		const { error: signOutError } = await authClient.signOut();
		if (signOutError) {
			toast.error(signOutError.message || `${signOutError.status} ${signOutError.statusText}`);
			setIsDeleting(false);
			return;
		}

		requestCloseUserProfile();
		toast.success('User deleted successfully');
		setDeleteDialogOpen(false);
		setIsDeleting(false);
	}

	return (
		<Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
			<Dialog.Trigger className="preset-faded-surface-50-950 btn rounded-base btn-sm text-surface-600-400 hover:bg-error-300-700 hover:text-error-950-50 justify-between gap-1 text-sm">
				Delete account
			</Dialog.Trigger>
			<Dialog.Content className="md:max-w-108">
				<Dialog.Header>
					<Dialog.Title>Delete your account</Dialog.Title>
					<Dialog.Description className="text-surface-700-300">
						Are you sure you want to delete your account? All of your data will be permanently
						deleted.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer className="w-full">
					<Dialog.Close className="btn preset-tonal" disabled={isDeleting}>
						Cancel
					</Dialog.Close>
					<button
						type="button"
						className="btn preset-filled-error-500"
						onClick={handleConfirm}
						disabled={isDeleting}
						aria-busy={isDeleting}
					>
						{isDeleting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
								Deleting...
							</>
						) : (
							'Delete'
						)}
					</button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	);
}
