'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

import { api } from '@/convex/_generated/api';
import * as Dialog from '@/components/primitives/ui/dialog';

/**
 * Admin "create user" dialog. Creates a user with an email/password and an
 * initial application role.
 */
export default function CreateUser() {
	const createUser = useMutation(api.admin.mutations.createUser);
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState('user');
	const [submitting, setSubmitting] = useState(false);

	function reset() {
		setName('');
		setEmail('');
		setPassword('');
		setRole('user');
	}

	async function handleSubmit() {
		setSubmitting(true);
		try {
			await createUser({ name, email, password, role });
			toast.success('User created');
			setOpen(false);
			reset();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to create user');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger className="btn preset-filled-primary-500 gap-2">
				<Plus className="size-4" />
				<span className="hidden sm:inline">New user</span>
			</Dialog.Trigger>
			<Dialog.Content className="md:max-w-108">
				<Dialog.Header>
					<Dialog.Title>Create user</Dialog.Title>
				</Dialog.Header>
				<div className="flex flex-col gap-3">
					<label className="label">
						<span>Name</span>
						<input
							type="text"
							className="input"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</label>
					<label className="label">
						<span>Email</span>
						<input
							type="email"
							className="input"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</label>
					<label className="label">
						<span>Password</span>
						<input
							type="password"
							className="input"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</label>
					<label className="label">
						<span>Role</span>
						<select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
							<option value="user">User</option>
							<option value="admin">Admin</option>
						</select>
					</label>
				</div>
				<Dialog.Footer>
					<button type="button" className="btn preset-tonal" onClick={() => setOpen(false)}>
						Cancel
					</button>
					<button
						type="button"
						className="btn preset-filled-primary-500"
						onClick={handleSubmit}
						disabled={submitting || !name || !email || !password}
					>
						Create
					</button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	);
}
