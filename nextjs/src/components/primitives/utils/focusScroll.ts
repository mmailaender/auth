export function isEditableElement(el: HTMLElement): boolean {
	const tag = el.tagName.toLowerCase();
	const role = el.getAttribute('role');
	return (
		tag === 'input' ||
		tag === 'textarea' ||
		tag === 'select' ||
		el.isContentEditable ||
		el.getAttribute('contenteditable') === 'true' ||
		role === 'textbox' ||
		role === 'combobox' ||
		role === 'searchbox'
	);
}

export function scheduleScrollIntoView(
	el: HTMLElement,
	options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center', inline: 'nearest' }
) {
	requestAnimationFrame(() => {
		requestAnimationFrame(() => el.scrollIntoView(options));
	});
}
