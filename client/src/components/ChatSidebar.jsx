import Users from "./Users";

export default function ChatSidebar({ searchResult, loadingUsers, users, onUserSelection }) {

    if (searchResult && searchResult.length > 0) {
        return (
            <>
                <div className="recent-users-loading-info">Search results</div>
                <Users users={searchResult} userSelectionHandler={onUserSelection} />
            </>
        );
    } else {

        if (users && users.length) {

            return <Users users={users} userSelectionHandler={onUserSelection} />;

        } else if (loadingUsers) {

            return <div className="recent-users-loading-info">loading conversations...</div>;

        } else {

            return <div className="recent-users-loading-info">You haven't started a conversation with anyone. Start a conversation by searching for users by their name or email.</div>

        }
    }
}
