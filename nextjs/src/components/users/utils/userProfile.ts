export function requestCloseUserProfile() {
	window.dispatchEvent(new CustomEvent('user-profile:close'));
}
