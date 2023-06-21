const app = Vue.createApp({
    name: 'Boolzapp',
    data() {
        return {
            activeContactId: 1,
            data
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
        }

    },

    methods: {
        setActiveId(id) {
            this.activeContactId = id;
        }
    },

    mount() {

    }

});

app.mount('#root');