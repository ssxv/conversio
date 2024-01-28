class MessageStore {


    /**
     * {
     *   userId1: [
     *      { from: userId1, to: userId0 },
     *      { from: userId0, to: userId1 },   
     *   ],
     *   userId2: [
     *      { from: userId2, to: userId0 },
     *      { from: userId0, to: userId2 },   
     *   ],
     * }
     */
    messageStore = {};

    getMessages = (userId) => this.messageStore[userId];

    setMessages = (userId, messages) => this.messageStore[userId] = messages;

    hasMessages = (userId) => {
        const oldMessages = this.messageStore[userId];
        return oldMessages && oldMessages.length;
    }

    getLastMessage = (userId) => {
        const oldMessages = this.messageStore[userId];
        return oldMessages && oldMessages.length && oldMessages[oldMessages.length - 1];
    }

    addMessages = (userId, messages) => {
        const oldMessages = this.messageStore[userId];
        const newMessages = (oldMessages && oldMessages.length) ?
            [...oldMessages, ...messages] : [...messages];

        const idSet = new Set();
        const distinctMessages = [];
        newMessages.forEach(m => {
            if (!idSet.has(m.clientId)) {
                idSet.add(m.clientId);
                distinctMessages.push(m);
            }
        });
        this.messageStore[userId] = distinctMessages;

        return { messages: distinctMessages };
    }

    addMessage = (userId, message) => {
        const { messages } = this.addMessages(userId, [message]);
        return { messages, message };
    }

    markRead = (userId) => {
        const oldMessages = this.messageStore[userId];
        const newMessages = oldMessages && oldMessages.length && oldMessages.map((message) => {
            if (message.to === userId) {
                message.read = true;
            }
            return message;
        });

        this.messageStore[userId] = newMessages;

        return { messages: newMessages };
    }

    markSuccess = (userId, message) => {
        const oldMessages = this.messageStore[userId];
        const newMessages = oldMessages && oldMessages.length && oldMessages.map((oldMessage) => {
            if (oldMessage.clientId === message.clientId) {
                oldMessage.id = message.id;
                delete oldMessage.error;
            }
            return oldMessage;
        });
        this.messageStore[userId] = newMessages;

        return { messages: newMessages };
    }

    markError = (userId, message) => {
        const oldMessages = this.messageStore[userId];
        const newMessages = oldMessages && oldMessages.length && oldMessages.map((oldMessage) => {
            if (oldMessage.clientId === message.clientId) {
                oldMessage.error = true;
            }
            return oldMessage;
        });
        this.messageStore[userId] = newMessages;

        return { messages: newMessages };
    }
}

export const MESSAGE_STORE = new MessageStore();
