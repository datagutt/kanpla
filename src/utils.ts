export function findDateInArray(timestamps: number[], dateToCheck = new Date()) {
	// Get the start of the day (00:00:00) and end of the day (23:59:59) for the dateToCheck
	const startOfDay = new Date(dateToCheck.setHours(0, 0, 0, 0)).getTime() / 1000;
	const endOfDay = new Date(dateToCheck.setHours(23, 59, 59, 999)).getTime() / 1000;

	// Check if any timestamp falls within this range
	const foundDate = timestamps.find(ts => ts >= startOfDay && ts <= endOfDay);

	if (foundDate) {
		return foundDate;
	} else {
		return null; // Or you can return a message like "Date not found"
	}
}