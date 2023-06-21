const app = Vue.createApp({
    name: 'Boolzapp',
    data() {
        return {
            data,
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
        }

    },

    methods: {
    },

    mount() {

    }

});

app.mount('#root');