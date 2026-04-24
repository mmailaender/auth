'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { ConvexError, GenericId } from 'convex/values';
import { Building2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import * as Avatar from '@/components/primitives/ui/avatar';
import * as ImageCropper from '@/components/primitives/ui/image-cropper';
import { optimizeImage } from '@/components/primitives/utils/optimizeImage';
import { api } from '@/convex/_generated/api';
import { useRoles } from '@/components/organizations/api/hooks';
import { useActiveOrganizationData, useActiveUserData } from '@/lib/auth/hooks';

export default function GeneralSettings() {
	const router = useRouter();
	const pathname = usePathname();
	const user = useActiveUserData();
	const activeOrganization = useActiveOrganizationData();
	const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
	const updateOrganization = useMutation(
		api.organizations.mutations.updateOrganizationProfile
	).withOptimisticUpdate((localStore, args) => {
		if (args.name === undefined) return;

		const name = args.name.trim();
		const activeOrganization = localStore.getQuery(
			api.organizations.queries.getActiveOrganization,
			{}
		);
		if (!activeOrganization) return;

		localStore.setQuery(
			api.organizations.queries.getActiveOrganization,
			{},
			{
				...activeOrganization,
				name
			}
		);

		const organizations = localStore.getQuery(api.organizations.queries.listOrganizations, {});
		if (organizations !== undefined) {
			localStore.setQuery(
				api.organizations.queries.listOrganizations,
				{},
				organizations.map((organization) =>
					organization.id === activeOrganization.id ? { ...organization, name } : organization
				)
			);
		}
	});
	const isOwnerOrAdmin = useRoles().hasOwnerOrAdminRole;

	const [imageLoadingStatus, setImageLoadingStatus] = useState<'loading' | 'loaded' | 'error'>(
		'loaded'
	);
	const [isUploading, setIsUploading] = useState(false);
	const [logoKey] = useState(0);
	const [cropSrc, setCropSrc] = useState('');
	const [isEditingName, setIsEditingName] = useState(false);
	const [name, setName] = useState('');
	const [isEditingSlug, setIsEditingSlug] = useState(false);
	const [slug, setSlug] = useState('');
	const [isSavingSlug, setIsSavingSlug] = useState(false);
	const nameInputRef = useRef<HTMLInputElement | null>(null);
	const slugInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (activeOrganization) {
			if (!isEditingName) setName(activeOrganization.name);
			if (!isEditingSlug) setSlug(activeOrganization.slug || '');
		}
	}, [activeOrganization, isEditingName, isEditingSlug]);

	useEffect(() => {
		if (activeOrganization?.logo && !cropSrc.startsWith('blob:')) {
			setCropSrc(activeOrganization.logo);
		}
	}, [activeOrganization?.logo, cropSrc]);

	async function handleCropped(url: string) {
		if (!activeOrganization) return;
		const previousLogo = activeOrganization.logo ?? '';
		try {
			setCropSrc(url);
			setIsUploading(true);
			const croppedFile = await ImageCropper.getFileFromUrl(url, 'logo.png');
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
			const { storageId } = (await response.json()) as { storageId: GenericId<'_storage'> };
			await updateOrganization({ logoId: storageId });
			setImageLoadingStatus('loaded');
			toast.success('Organization logo updated successfully');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An unknown error occurred';
			toast.error(`Failed to update logo: ${message}`);
			setCropSrc(previousLogo);
			setImageLoadingStatus('error');
		} finally {
			setIsUploading(false);
		}
	}

	async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!activeOrganization) return;

		const trimmed = name.trim();

		try {
			if (!trimmed || trimmed === activeOrganization.name.trim()) {
				setIsEditingName(false);
				return;
			}
			setName(trimmed);
			setIsEditingName(false);
			await updateOrganization({ name: trimmed });
			toast.success('Organization name updated successfully');
		} catch (err) {
			const message =
				err instanceof ConvexError
					? err.data
					: err instanceof Error
						? err.message
						: 'An unknown error occurred';
			toast.error(`Failed to update organization: ${message}`);
		}
	}

	async function handleSlugSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!activeOrganization || isSavingSlug) return;

		try {
			const trimmed = slug.trim();
			const currentSlug = activeOrganization.slug || '';
			if (trimmed === '' || trimmed === currentSlug) {
				setIsEditingSlug(false);
				return;
			}
			setIsSavingSlug(true);
			await updateOrganization({ slug: trimmed });
			if (
				currentSlug &&
				(pathname.includes(`/${currentSlug}/`) || pathname.endsWith(`/${currentSlug}`))
			) {
				router.replace(pathname.replace(new RegExp(`/${currentSlug}(?=/|$)`, 'g'), `/${trimmed}`));
			}
			setIsEditingSlug(false);
			toast.success('Organization slug updated successfully');
		} catch (err) {
			const message =
				err instanceof ConvexError
					? err.data
					: err instanceof Error
						? err.message
						: 'An unknown error occurred';
			toast.error(`Failed to update organization: ${message}`);
		} finally {
			setIsSavingSlug(false);
		}
	}

	if (!user || !activeOrganization) return null;
	const displayedLogoSrc = cropSrc || activeOrganization.logo || undefined;
	const showLogoOverlay =
		!cropSrc.startsWith('blob:') && (isUploading || imageLoadingStatus === 'loading');

	return (
		<div className="flex w-full flex-col items-start gap-6">
			<ImageCropper.Root
				src={cropSrc}
				onSrcChange={setCropSrc}
				accept="image/*"
				onCropped={handleCropped}
			>
				<ImageCropper.UploadTrigger>
					<div className="rounded-container relative cursor-pointer transition-all duration-200">
						<Avatar.Root
							key={logoKey}
							className="rounded-container size-20"
							onStatusChange={(details) => setImageLoadingStatus(details.status)}
						>
							<Avatar.Image
								src={displayedLogoSrc}
								alt={activeOrganization.name || 'Organization'}
							/>
							<Avatar.Fallback className="bg-surface-300-700 hover:bg-surface-400-600/80 rounded-container duration-150 ease-in-out">
								<Building2 className="text-surface-700-300 size-10" />
							</Avatar.Fallback>
						</Avatar.Root>
						{showLogoOverlay ? (
							<div className="bg-surface-50-950 rounded-container pointer-events-none absolute inset-0 flex items-center justify-center">
								<div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-b-transparent" />
							</div>
						) : null}
						<div className="badge-icon preset-filled-surface-300-700 ring-surface-50-950 dark:ring-surface-100-900 absolute -right-1.5 -bottom-1.5 size-3 rounded-full ring-4">
							<Pencil className="size-4" />
						</div>
					</div>
				</ImageCropper.UploadTrigger>
				<ImageCropper.Dialog>
					<ImageCropper.Cropper cropShape="rect" />
					<ImageCropper.Controls>
						<ImageCropper.Cancel />
						<ImageCropper.Crop>Upload</ImageCropper.Crop>
					</ImageCropper.Controls>
				</ImageCropper.Dialog>
			</ImageCropper.Root>

			<div className="flex w-full flex-col gap-3">
				<InlineEditableField
					label="Organization name"
					value={activeOrganization.name}
					editValue={name}
					setEditValue={setName}
					isEditing={isEditingName}
					setIsEditing={setIsEditingName}
					canEdit={isOwnerOrAdmin}
					inputRef={nameInputRef}
					onSubmit={handleNameSubmit}
					ariaLabel="Edit organization name"
				/>
				<InlineEditableField
					label="Slug"
					value={activeOrganization.slug || ''}
					editValue={slug}
					setEditValue={setSlug}
					isEditing={isEditingSlug}
					setIsEditing={setIsEditingSlug}
					canEdit={isOwnerOrAdmin}
					inputRef={slugInputRef}
					onSubmit={handleSlugSubmit}
					ariaLabel="Edit organization slug"
					isSubmitting={isSavingSlug}
				/>
			</div>
		</div>
	);
}

function InlineEditableField({
	label,
	value,
	editValue,
	setEditValue,
	isEditing,
	setIsEditing,
	canEdit,
	inputRef,
	onSubmit,
	ariaLabel,
	isSubmitting = false
}: {
	label: string;
	value: string;
	editValue: string;
	setEditValue: (value: string) => void;
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
	canEdit: boolean;
	inputRef: React.RefObject<HTMLInputElement | null>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	ariaLabel: string;
	isSubmitting?: boolean;
}) {
	return (
		<div
			className={[
				'border-surface-300-700 rounded-container relative w-full border px-3.5 py-2 transition-all duration-200 ease-in-out',
				canEdit && !isEditing
					? 'hover:bg-surface-200-800 hover:border-surface-200-800 cursor-pointer'
					: ''
			].join(' ')}
		>
			<div className="flex items-center justify-between gap-3 transition-all duration-200 ease-in-out">
				<div className="flex w-full flex-col gap-0">
					<span className="text-surface-600-400 text-xs">{label}</span>
					<div
						className={[
							'grid transition-[grid-template-rows] duration-200 ease-in-out',
							isEditing ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
							!isEditing ? 'mt-1' : ''
						].join(' ')}
						aria-hidden={isEditing}
						inert={isEditing}
					>
						<div className="overflow-hidden">
							<span className="truncate text-sm">{value}</span>
						</div>
					</div>
					<div
						className={[
							'grid transition-[grid-template-rows] duration-200 ease-in-out',
							isEditing ? 'mt-1 grid-rows-[1fr]' : 'grid-rows-[0fr]'
						].join(' ')}
						aria-hidden={!isEditing}
						inert={!isEditing}
					>
						<div className="overflow-hidden">
							<form onSubmit={onSubmit} className="flex w-full flex-col gap-3">
								<input
									ref={inputRef}
									type="text"
									className="input w-full"
									value={editValue}
									onChange={(event) => setEditValue(event.currentTarget.value)}
									disabled={isSubmitting}
								/>
								<div className="mb-1 flex gap-1.5">
									<button
										type="button"
										className="btn btn-sm preset-tonal w-full"
										disabled={isSubmitting}
										onClick={() => {
											setEditValue(value);
											setIsEditing(false);
										}}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="btn btn-sm preset-filled-primary-500 w-full"
										disabled={
											isSubmitting ||
											!editValue ||
											editValue.trim() === '' ||
											editValue.trim() === value.trim()
										}
									>
										{isSubmitting ? 'Saving...' : 'Save'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
				{canEdit && !isEditing ? (
					<>
						<div className="shrink-0">
							<span className="btn-icon preset-filled-surface-50-950 pointer-events-none p-2">
								<Pencil className="size-4" />
							</span>
						</div>
						<button
							className="absolute inset-0 h-full w-full"
							aria-label={ariaLabel}
							type="button"
							onClick={() => {
								setIsEditing(true);
								setEditValue(value);
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
	);
}
