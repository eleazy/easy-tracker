export const getTodayString = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
};

let loggedUser = null;
export const setLoggedUser = (value) => loggedUser = value;
export const getLoggedUser = () => loggedUser;

