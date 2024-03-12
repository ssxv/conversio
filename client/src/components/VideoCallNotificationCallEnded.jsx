export default function VideoCallNotificationCallEnded({ name }) {

    return (
        <div className="notification">
            <div className="notification-content">
                <div className="contact-title">{name}</div>
                <div className="contact-subtitle">has ended the call</div>
            </div>
        </div>
    );
}