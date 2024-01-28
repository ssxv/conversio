export const getReqConfig = (token) => {
    if (token) {
        return { headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}` } };
    }
    return { headers: { "Content-type": "application/json" } };
}

export const toQueryParams = (obj) => {
    return `?${Object.keys(obj).map(key => {
        const value = obj[key];
        return `${key}=${encodeURIComponent(value)}`;
    }).join('&')}`;
}
