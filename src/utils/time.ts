export function timeAgo(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (seconds < 60) return "Now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}min ago 🕑`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `il y a ${hours}h`;
	const days = Math.floor(hours / 24);
	return `il y a ${days}j`;
}
