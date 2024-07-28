export function convertMinutesToHours(timeInMinutes: number): string {
    if (timeInMinutes < 60) {
        return `${timeInMinutes} min`
    } else {
        let hours = Math.floor(timeInMinutes / 60);
        let minutes = timeInMinutes % 60;

        if (hours === 1) {
            return `${hours} hour ${minutes} min`
        }

        return `${hours} hours ${minutes} min`
    }
}

export function convertHtmlTextToPlainText(htmlText: string): string {
    return htmlText.replace(/(<([^>]+)>)/ig, ' ').replace(/\s+/g, ' ').trim();
}