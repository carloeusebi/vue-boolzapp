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
            return this.contacts.find(({ id }) => id === this.activeContactId);
        },

        newMessageId() {
            //todo proper logic
            return 5;
        },
    },

    methods: {
        setActiveId(id) {
            this.activeContactId = id;
        },

        sendMessage() {
            const getCurrentTime = () => {
                const dateObj = new Date()
                const date = dateObj.toLocaleDateString();
                const time = dateObj.toLocaleTimeString();

                return date + ' ' + time;

            };

            const message = this.newMessage;
            const id = this.newMessageId;
            const date = getCurrentTime();
            const status = 'sent';

            const justSentMessage = { id, date, message, status }

            this.data.contacts.forEach(contact => {
                if (contact.id === this.activeContactId) {
                    contact.messages.push(justSentMessage);
                }
            })



            this.newMessage = '';
        }
    },

    mount() {

    }

});

app.mount('#root');