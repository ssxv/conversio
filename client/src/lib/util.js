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

export const getMediaStream = async (video, audio) => {
    const videoDevice = await getVideoDevice();
    const constraints = {};
    if (video) {
        constraints.video = {
            deviceId: videoDevice.deviceId,
            width: { min: 1024, ideal: 1280, max: 1920 },
            height: { min: 576, ideal: 720, max: 1080 },
        }
    }
    if (audio) {
        constraints.audio = true;
    }
    try {
        return navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
        console.log(error);
    }
}

export const getVideoDevice = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.find(d => d.kind === 'videoinput');
    } catch (error) {
        console.log(error);
    }
}

export const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const defaultNotificationOptions = {
    insert: "top",
    container: "top-right",
}
