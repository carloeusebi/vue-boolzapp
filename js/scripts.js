const app = Vue.createApp({
    name: 'Boolzapp',
    data() {
        return {
            data,
            activeContactId: 1,
            newMessage: '',
            contactSearchWord: ''
        }
    },

    computed: {
        user() {
            const { name, avatar } = this.data.user;
            return { name, avatar: `img/avatar${avatar}.jpg` };
        },

        contacts() {
            return this.data.contacts.map(({ id, name, avatar, visible, messages }) => {

                const lastMessage = messages[messages.length - 1];

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
            const searchedWord = this.contactSearchWord.toLowerCase
            return this.contacts.filter(({ name }) => name.toLowerCase().includes(this.contactSearchWord));
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

        sendMessage() {
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

            const message = this.newMessage;

            if (!message) return;

            const id = getMessageId(activeContact);
            const date = getCurrentTime();
            const status = 'sent';

            const justSentMessage = { id, date, message, status }

            activeContact.messages.push(justSentMessage);

            this.newMessage = '';

            //TODO chatgpt should handle the response :)

            setTimeout(() => {
                const id = getMessageId(activeContact);
                const date = getCurrentTime();
                const status = 'received';
                const message = 'ok...';

                const responseMessage = { id, date, message, status };

                activeContact.messages.push(responseMessage);
            }, 1000);

        }
    },

    mount() {

    }

});

app.mount('#root');