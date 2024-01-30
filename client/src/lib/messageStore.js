class MessageStore {

    /**
     * {
     *   "userId1": {
     *      "messageId1": { id: "messageId1", from: "userId1", to: "userId2" },
     *      "messageId2": { id: "messageId2", from: "userId2", to: "userId1" },
     *   },
     *   "userId2": {
     *      "messageId1": { id: "messageId1", from: "userId1", to: "userId2" },
     *      "messageId2": { id: "messageId2", from: "userId2", to: "userId1" },
     *   },
     * }
     */
    store = new Map();

    getMessagesMap = (userId) => {
        return this.store.get(userId) ?
            this.store.get(userId) :
            new Map();
    }

    setMessagesMap = (userId, messagesMap) => {
        this.store.set(userId, messagesMap);
    }

    getMessages = (userId) => {
        return [...this.getMessagesMap(userId).values()];
    }

    getLastMessage = (userId) => {
        const messages = this.getMessages(userId);
        return messages && messages.length && messages[messages.length - 1];
    }

    addMessages = (userId, messages) => {
        const messagesMap = this.getMessagesMap(userId);
        messages.forEach(message => messagesMap.set(message.clientId, message));
        this.setMessagesMap(userId, messagesMap);
        return { messages: this.getMessages(userId) };
    }

    addMessage = (userId, message) => {
        return { messages: this.addMessages(userId, [message]), message };
    }

    markRead = (userId) => {
        this.getMessagesMap(userId).forEach((message) => {
            if (message.to === userId) {
                message.read = true;
            }
        });
        return { messages: this.getMessages(userId) };
    }

    markSuccess = (userId, message) => {
        const existingMessage = this.getMessagesMap(userId).get(message.clientId);
        if (existingMessage) {
            existingMessage.id = message.id;
            delete existingMessage.error;
        }
        return { messages: this.getMessages(userId) };
    }

    markError = (userId, message) => {
        const existingMessage = this.getMessagesMap(userId).get(message.clientId);
        if (existingMessage) {
            existingMessage.id = message.id;
            delete existingMessage.error;
        }
        return { messages: this.getMessages(userId) };
    }
}

export const MESSAGE_STORE = new MessageStore();
