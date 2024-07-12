export declare global {
    type StepsArray = {
        distance: string,
        end_location: {
            lat: number,
            lng: number
        },
        instruction: string
    }[];
}