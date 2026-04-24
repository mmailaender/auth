'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { GenericId } from 'convex/values';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

import * as Avatar from '@/components/primitives/ui/avatar';
import * as ImageCropper from '@/components/primitives/ui/image-cropper';
import { optimizeImage } from '@/components/primitives/utils/optimizeImage';
import { api } from '@/convex/_generated/api';
import { useActiveUserData } from '@/lib/auth/hooks';

export default function ProfileInfo() {
	const activeUser = useActiveUserData();
	const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
	const updateProfile = useMutation(api.users.mutations.updateProfile).withOptimisticUpdate(
		(localStore, args) => {
			const activeUser = localStore.getQuery(api.users.queries.getActiveUser, {});
			if (!activeUser) return;

			localStore.setQuery(
				api.users.queries.getActiveUser,
				{},
				{
					...activeUser,
					...(args.name !== undefined ? { name: args.name.trim() } : {})
				}
			);
		}
	);
	const updateAvatar = useMutation(api.users.mutations.updateAvatar).withOptimisticUpdate(
		(localStore, args) => {
			if (!args.optimisticImage) return;

			const activeUser = localStore.getQuery(api.users.queries.getActiveUser, {});
			if (!activeUser) return;

			localStore.setQuery(
				api.users.queries.getActiveUser,
				{},
				{
					...activeUser,
					image: args.optimisticImage
				}
			);
		}
	);

	const [isEditingName, setIsEditingName] = useState(false);
	const [name, setName] = useState('');
	const [loadingStatus, setLoadingStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
	const [isUploading, setIsUploading] = useState(false);
	const [avatarKey] = useState(0);
	const [cropSrc, setCropSrc] = useState('');
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (activeUser && !isEditingName) {
			setName(activeUser.name);
		}
	}, [activeUser, isEditingName]);

	useEffect(() => {
		if (activeUser?.image && !cropSrc.startsWith('blob:')) {
			setCropSrc(activeUser.image);
		}
	}, [activeUser?.image, cropSrc]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!activeUser) return;

		try {
			const trimmed = name.trim();
			if (!trimmed || trimmed === activeUser.name.trim()) {
				setIsEditingName(false);
				return;
			}
			setName(trimmed);
			setIsEditingName(false);
			await updateProfile({ name: trimmed });
			toast.success('Profile name updated successfully');
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
			toast.error(`Failed to update profile: ${errorMsg}`);
		}
	}

	async function handleCropped(url: string) {
		const previousImage = activeUser?.image ?? '';
		try {
			setCropSrc(url);
			setIsUploading(true);
			const croppedFile = await ImageCropper.getFileFromUrl(url, 'avatar.png');
			const optimizedFile = await optimizeImage(croppedFile, {
				maxWidth: 512,
				maxHeight: 512,
				maxSizeKB: 500,
				quality: 0.85,
				format: 'webp',
				forceConvert: true
			});

			const uploadUrl = await generateUploadUrl({});
			const response = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': optimizedFile.type },
				body: optimizedFile
			});
			if (!response.ok) throw new Error('Failed to upload file');

			const result = (await response.json()) as { storageId: GenericId<'_storage'> };
			await updateAvatar({ storageId: result.storageId, optimisticImage: url });

			setLoadingStatus('loaded');
			toast.success('Avatar updated successfully');
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
			toast.error(`Failed to upload avatar: ${errorMsg}`);
			setCropSrc(previousImage);
			setLoadingStatus('error');
		} finally {
			setIsUploading(false);
		}
	}

	if (!activeUser) {
		return <div className="placeholder h-16 w-full animate-pulse" />;
	}

	const displayedAvatarSrc = cropSrc || activeUser.image || undefined;
	const showAvatarOverlay =
		!cropSrc.startsWith('blob:') && (isUploading || loadingStatus === 'loading');

	return (
		<div className="flex flex-col gap-6">
			<div className="rounded-base flex items-center justify-start pt-6 pl-0.5">
				<ImageCropper.Root
					src={cropSrc}
					onSrcChange={setCropSrc}
					accept="image/*"
					onCropped={handleCropped}
				>
					<ImageCropper.UploadTrigger>
						<div className="rounded-container relative size-20 cursor-pointer transition-all duration-200">
							<div className="relative cursor-pointer transition-colors">
								<Avatar.Root
									key={avatarKey}
									className="size-20"
									onStatusChange={(details) => setLoadingStatus(details.status)}
								>
									<Avatar.Image src={displayedAvatarSrc} alt={activeUser.name} />
									<Avatar.Fallback className="bg-surface-300-700 hover:bg-surface-400-600/80 rounded-container duration-150 ease-in-out">
										<Avatar.Marble name={activeUser.name} />
									</Avatar.Fallback>
								</Avatar.Root>
								{showAvatarOverlay ? (
									<div className="bg-surface-50-950 pointer-events-none absolute inset-0 flex items-center justify-center rounded-full">
										<div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-b-transparent" />
									</div>
								) : null}
								<div className="badge-icon preset-filled-surface-300-700 ring-surface-50-950 dark:ring-surface-100-900 hover:bg-surface-400-600 absolute -right-1.5 -bottom-1.5 size-3 rounded-full ring-4">
									<Pencil className="size-4" />
								</div>
							</div>
						</div>
					</ImageCropper.UploadTrigger>
					<ImageCropper.Dialog>
						<ImageCropper.Cropper cropShape="round" />
						<ImageCropper.Controls>
							<ImageCropper.Cancel />
							<ImageCropper.Crop>Upload</ImageCropper.Crop>
						</ImageCropper.Controls>
					</ImageCropper.Dialog>
				</ImageCropper.Root>
			</div>

			<div
				className={[
					'border-surface-300-700 rounded-container relative w-full border px-3.5 py-2 transition-all duration-200 ease-in-out',
					!isEditingName
						? 'hover:bg-surface-200-800 hover:border-surface-200-800 cursor-pointer'
						: ''
				].join(' ')}
			>
				<div className="flex items-center justify-between gap-3 transition-all duration-200 ease-in-out">
					<div className="flex w-full flex-col">
						<span className="text-surface-600-400 text-xs">Name</span>
						<div
							className={[
								'grid transition-[grid-template-rows] duration-200 ease-in-out',
								isEditingName ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
								!isEditingName ? 'mt-1' : ''
							].join(' ')}
							aria-hidden={isEditingName}
							inert={isEditingName}
						>
							<div className="overflow-hidden">
								<span className="truncate text-sm">{activeUser.name}</span>
							</div>
						</div>

						<div
							className={[
								'grid transition-[grid-template-rows] duration-200 ease-in-out',
								isEditingName ? 'mt-1 grid-rows-[1fr]' : 'grid-rows-[0fr]'
							].join(' ')}
							aria-hidden={!isEditingName}
							inert={!isEditingName}
						>
							<div className="overflow-hidden">
								<form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
									<input
										ref={inputRef}
										type="text"
										className="input w-full"
										value={name}
										onChange={(event) => setName(event.currentTarget.value)}
									/>
									<div className="mb-1 flex gap-1.5">
										<button
											type="button"
											className="btn btn-sm preset-tonal w-full"
											onClick={() => {
												setName(activeUser.name);
												setIsEditingName(false);
											}}
										>
											Cancel
										</button>
										<button
											type="submit"
											className="btn btn-sm preset-filled-primary-500 w-full"
											disabled={
												!name || name.trim() === '' || name.trim() === activeUser.name.trim()
											}
										>
											Save
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
					{!isEditingName ? (
						<>
							<div>
								<span className="btn-icon preset-filled-surface-50-950 pointer-events-none p-2">
									<Pencil className="size-4" />
								</span>
							</div>
							<button
								className="absolute inset-0 h-full w-full"
								aria-label="Edit name"
								type="button"
								onClick={() => {
									setIsEditingName(true);
									setName(activeUser.name);
									requestAnimationFrame(() => {
										inputRef.current?.focus();
										inputRef.current?.select();
									});
								}}
							/>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
