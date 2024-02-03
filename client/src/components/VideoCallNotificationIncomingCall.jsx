export default function VideoCallNotificationIncomingCall({ name, onAnswer, onDecline }) {

    return (
        <div className="notification">
            <div className="contact-title">{name}</div>
            <div className="contact-subtitle">calling...</div>
            <div className="display-horizontal mt-2">
                <button className="button-primary mr-2" onClick={onAnswer}>Answer Call</button>
                <button className="button-danger" onClick={onDecline}>Decline Call</button>
            </div>
        </div>
    );
}