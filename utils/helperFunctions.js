export const getTodayString = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
};
