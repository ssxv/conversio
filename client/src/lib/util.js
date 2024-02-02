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

export const canGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export const getMediaStream = (video, audio, onStream) => {
    const constraints = {};
    if (video) {
        constraints.video = {
            width: { min: 1024, ideal: 1280, max: 1920 },
            height: { min: 576, ideal: 720, max: 1080 },
        }
    }
    if (audio) {
        constraints.audio = true;
    }
    return navigator.mediaDevices.getUserMedia(constraints).then(onStream).catch((err) => console.log(err));
}
