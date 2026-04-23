'use client';

import * as React from 'react';
import { Progress as ArkProgress } from '@ark-ui/react/progress';
import { zxcvbn, zxcvbnOptions, type ZxcvbnResult } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

zxcvbnOptions.setOptions({
	translations: zxcvbnEnPackage.translations,
	graphs: zxcvbnCommonPackage.adjacencyGraphs,
	dictionary: {
		...zxcvbnCommonPackage.dictionary,
		...zxcvbnEnPackage.dictionary
	}
});

const PasswordContext = React.createContext<{
	visible: boolean;
	setVisible: React.Dispatch<React.SetStateAction<boolean>>;
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	minScore: number;
	strength: ZxcvbnResult;
	submitted: boolean;
	setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
	inputEl: HTMLInputElement | null;
	setInputEl: React.Dispatch<React.SetStateAction<HTMLInputElement | null>>;
	errorId: string;
	errorMessage: string | null;
}>({
	visible: false,
	setVisible: () => {},
	value: '',
	setValue: () => {},
	minScore: 3,
	strength: zxcvbn(''),
	submitted: false,
	setSubmitted: () => {},
	inputEl: null,
	setInputEl: () => {},
	errorId: '',
	errorMessage: null
});

function getErrorMessage(input: HTMLInputElement | null, submitted: boolean) {
	if (!submitted || !input || input.validity.valid) return null;
	const placeholder = input.getAttribute('placeholder')?.trim();
	if (input.validity.valueMissing && placeholder) {
		return placeholder.endsWith('.') ? placeholder : `${placeholder}.`;
	}
	if (input.validity.valueMissing) return 'Enter a password.';
	return input.validationMessage || 'Invalid value';
}

type RootProps = {
	children: React.ReactNode;
	hidden?: boolean;
	minScore?: number;
	onerror?: (error: { message: string }) => void;
};

function Root({ children, hidden = true, minScore = 3, onerror }: RootProps) {
	const [visible, setVisible] = React.useState(!hidden);
	const [value, setValue] = React.useState('');
	const [submitted, setSubmitted] = React.useState(false);
	const [inputEl, setInputEl] = React.useState<HTMLInputElement | null>(null);
	const errorId = React.useId();
	const strength = React.useMemo(() => zxcvbn(value), [value]);
	const errorMessage = getErrorMessage(inputEl, submitted);
	const lastErrorRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		if (!errorMessage) {
			lastErrorRef.current = null;
			return;
		}
		if (errorMessage !== lastErrorRef.current) {
			onerror?.({ message: errorMessage });
			lastErrorRef.current = errorMessage;
		}
	}, [errorMessage, onerror]);

	return (
		<PasswordContext.Provider
			value={{
				visible,
				setVisible,
				value,
				setValue,
				minScore,
				strength,
				submitted,
				setSubmitted,
				inputEl,
				setInputEl,
				errorId,
				errorMessage
			}}
		>
			<div className="flex flex-col gap-1.5">{children}</div>
		</PasswordContext.Provider>
	);
}

type InputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
	children?: React.ReactNode;
	ref?: React.Ref<HTMLInputElement>;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
	if (!ref) return;
	if (typeof ref === 'function') ref(value);
	else ref.current = value;
}

function Input({
	className,
	children,
	onChange,
	onInvalid,
	value,
	defaultValue,
	ref,
	...props
}: InputProps) {
	const {
		visible,
		setValue,
		value: passwordValue,
		minScore,
		strength,
		setSubmitted,
		setInputEl,
		errorId,
		errorMessage
	} = React.useContext(PasswordContext);
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	React.useEffect(() => {
		setValue(String(value ?? defaultValue ?? ''));
	}, [defaultValue, setValue, value]);

	React.useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		if (passwordValue !== '' && strength.score < minScore) {
			input.setCustomValidity('Password is too weak');
		} else {
			input.setCustomValidity('');
		}
	}, [minScore, passwordValue, strength.score]);

	React.useEffect(() => {
		const form = inputRef.current?.form;
		if (!form) return;
		const onSubmit = () => setSubmitted(true);
		const onInvalidCapture = () => setSubmitted(true);
		form.addEventListener('submit', onSubmit, true);
		form.addEventListener('invalid', onInvalidCapture, true);
		return () => {
			form.removeEventListener('submit', onSubmit, true);
			form.removeEventListener('invalid', onInvalidCapture, true);
		};
	}, [setSubmitted]);

	return (
		<div className="input-group grid-cols-[1fr_auto]">
			<input
				ref={(node) => {
					inputRef.current = node;
					setInputEl(node);
					assignRef(ref, node);
				}}
				className={cn('ig-input', className)}
				type={visible ? 'text' : 'password'}
				minLength={8}
				value={value}
				defaultValue={defaultValue}
				aria-describedby={errorMessage ? errorId : props['aria-describedby']}
				aria-invalid={errorMessage ? true : props['aria-invalid']}
				onChange={(event) => {
					setValue(event.currentTarget.value);
					setSubmitted(false);
					onChange?.(event);
				}}
				onInvalid={(event) => {
					setSubmitted(true);
					onInvalid?.(event);
				}}
				{...props}
			/>
			{children}
		</div>
	);
}

function ToggleVisibility({ className, ...props }: React.ComponentProps<'button'>) {
	const { visible, setVisible } = React.useContext(PasswordContext);
	return (
		<button
			type="button"
			className={cn('ig-btn preset-filled-surface-200-800', className)}
			onClick={() => setVisible((value) => !value)}
			aria-label={visible ? 'Hide password' : 'Show password'}
			{...props}
		>
			{visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
		</button>
	);
}

function Error() {
	const { errorId, errorMessage } = React.useContext(PasswordContext);
	if (!errorMessage) return null;
	return (
		<span id={errorId} className="text-error-600-400 pb-1 text-xs" aria-live="polite" role="status">
			{errorMessage}
		</span>
	);
}

function Strength({ className }: { className?: string }) {
	const { strength } = React.useContext(PasswordContext);
	const score = strength.score;
	const color =
		score <= 1
			? 'bg-error-600-400'
			: score === 2
				? 'bg-warning-700-300'
				: score === 3
					? 'bg-warning-600-400'
					: 'bg-success-600-400';

	return (
		<ArkProgress.Root
			value={score}
			min={0}
			max={4}
			className={cn(
				'bg-surface-200-800 relative h-1 w-full gap-1 overflow-hidden rounded-full',
				className
			)}
		>
			<ArkProgress.Track className="h-full w-full">
				<ArkProgress.Range
					className={cn('block h-full transition-all duration-500', color)}
					style={{ width: `${(score / 4) * 100}%` }}
				/>
			</ArkProgress.Track>
			<div className="absolute top-0 left-0 z-10 flex h-1 w-full place-items-center gap-1 px-0.5">
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="ring-surface-100-900 h-1 w-1/4 rounded-full ring-3" />
				))}
			</div>
		</ArkProgress.Root>
	);
}

export { Root, Input, ToggleVisibility, Error, Strength };
