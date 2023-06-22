const app = Vue.createApp({
    name: 'Boolzapp',
    data() {
        return {
            data,
            activeContactId: 1,
            isTyping: 0,
            newMessage: '',
            contactSearchWord: '',
            messageMenu: [],
        }
    },

    computed: {
        user() {
            const { name, avatar } = this.data.user;
            return { name, avatar: `img/avatar${avatar}.jpg` };
        },

        contacts() {
            return this.data.contacts.map(({ id, name, avatar, visible, messages }) => {

                let lastMessage = '';

                if (messages.length > 0) {
                    lastMessage = messages[messages.length - 1];
                }

                return {
                    id,
                    name,
                    visible,
                    avatar: `img/avatar${avatar}.jpg`,
                    messages,
                    lastMessage
                }
            });
        },

        filteredContactsBySearch() {
            const searchedWord = this.contactSearchWord.toLowerCase();
            return this.contacts.filter(({ name }) => name.toLowerCase().includes(searchedWord));
        },

        activeContact() {
            return this.getActiveContact();
        },

    },

    methods: {
        isActiveContact(id) {
            return id === this.activeContactId;
        },

        setActiveId(id) {
            this.activeContactId = id;
        },

        getActiveContact() {
            return this.contacts.find(({ id }) => id === this.activeContactId);
        },

        showMessageMenu(i) {
            this.hideAllMessageMenus();
            setTimeout(() => {
                this.messageMenu[i] = true
            }, 100);
        },

        hideAllMessageMenus() {
            setTimeout(() => {
                this.messageMenu = this.messageMenu.map(elem => elem = false)
            }, 50);

        },

        deleteMessage(id) {

            /* in order to "really" delete the message we need to delete the original entry on the data structure;
            since we can't use references to do so we first need to find the index in the data array were our current active contact is located at */

            const index = this.data.contacts.findIndex(contact => contact.id === this.activeContactId);

            /* once we have found the index we can use it to directly access the active contact's messages in data and delete it
            */

            this.data.contacts[index].messages = this.data.contacts[index].messages.filter(message =>
                message.id !== id);
        },

        async getGptResponse() {
            const completeChat = [{
                role: "system",
                content: `Fingiamo una conversazione whatsapp, io mi chiamo ${this.user.name} e tu ti chiamo ${this.activeContact.name}`
            }];

            this.activeContact.messages.forEach(({ message, status }) => {
                const role = status === 'sent' ? 'user' : 'assistant';
                completeChat.push({ role, content: message });
            });

            return await makeRequest({
                temperature: 0.9,
                model: 'gpt-3.5-turbo',
                messages: completeChat
            })
        },

        async sendMessage() {
            /**
             * calculates the current time
             * @returns the current times
             */
            const getCurrentTime = () => {
                const dateObj = new Date()
                const date = dateObj.toLocaleDateString();
                const time = dateObj.toLocaleTimeString();

                return date + ' ' + time;
            };

            /**
             * Checks all the contact messages ids and returns the lowest possibile non present id
             * @returns the id for the new message
             */
            const getMessageId = (contact) => contact.messages.reduce((highest, { id }) => id > highest ? id : highest, 0) + 1;

            const activeContact = this.getActiveContact();

            let message = this.newMessage;

            if (!message) return;

            let id = getMessageId(activeContact);
            let date = getCurrentTime();
            let status = 'sent';

            const justSentMessage = { id, date, message, status }

            activeContact.messages.push(justSentMessage);

            this.newMessage = '';

            //TODO chatgpt should handle the response :)

            this.isTyping = this.activeContactId;

            message = await this.getGptResponse();

            id = getMessageId(activeContact);
            date = getCurrentTime();
            status = 'received';

            const response = { id, date, message, status };

            activeContact.messages.push(response);

            this.isTyping = 0;

        }
    },

    mount() {

    }

});

app.mount('#root');

async function makeRequest(payload) {
    const url = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_KEY
        }
    });

    const jsonResponse = await response.json();
    return jsonResponse.choices[0].message.content;
}