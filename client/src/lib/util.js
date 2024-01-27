export const prepareReqConfig = (token) => {
    if (token) {

        return { headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}` } };
    }
    return { headers: { "Content-type": "application/json" } };
};
