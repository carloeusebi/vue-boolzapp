const app = Vue.createApp({
    name: 'Boolzapp',
    data() {
        return {
            data,
            activeContactId: 1,
            newMessage: ''
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

        activeContact() {
            return this.getActiveContact();
        }
    },

    methods: {
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
             * @param {object} contact 
             * @returns 
             */
            const getMessageId = contact => activeContact.messages.reduce((highest, { id }) => id > highest ? id : highest, 0) + 1;

            const activeContact = this.getActiveContact();

            const message = this.newMessage;

            if (!message) return;

            const id = getMessageId();
            const date = getCurrentTime();
            const status = 'sent';

            const justSentMessage = { id, date, message, status }

            activeContact.messages.push(justSentMessage);

            this.newMessage = '';
        }
    },

    mount() {

    }

});

app.mount('#root');