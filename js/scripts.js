const APY_KEY = (typeof KEY !== 'undefined') ? KEY : false;

/**
 * Checks all the contact messages ids and returns the lowest possibile non present id
 * @returns the id for the new message
 */
const getMessageId = (contact) => contact.messages.reduce((highest, { id }) => id > highest ? id : highest, 0) + 1;

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


const createMessage = (contact, message, status) => {
    const id = getMessageId(contact);
    const date = getCurrentTime();
    return { id, message, status, date };
}


async function getGptResponse(userName, contact) {
    const completeChat = [{
        role: "system",
        content: `Fingiamo una conversazione whatsapp, user si chiama ${userName} e assistant ${contact.name}, ricordati di fingere una versa persona e non un language model`
    }];

    contact.messages.forEach(({ message, status }) => {
        const role = status === 'sent' ? 'user' : 'assistant';
        completeChat.push({ role, content: message });
    });

    return await makeRequest({
        temperature: 0.9,
        model: 'gpt-3.5-turbo',
        messages: completeChat
    })
};


async function makeRequest(payload) {
    const url = 'https://api.openai.com/v1/chat/completions';

    let message = '';

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + APY_KEY
        }
    });

    if (response.status === 200) {
        const jsonResponse = await response.json();
        message = jsonResponse.choices[0].message.content;
    } else {
        message = 'Impossibile comunicare con ChatGPT, errore: ' + response.status;
    }

    return message;
}


async function getResponse(userName, contact) {

    let message = `Non è stata rilevata nessuna API KEY per chat GPT, quindi non potrà rispondere.<br>
    Per poter attivare chatGPT creare un file auth.js nella cartella JS ed inserire la propria chiave in una variabile con il nome KEY.`;

    if (APY_KEY) {
        message = await getGptResponse(userName, contact);
    }

    const status = 'received';
    const messageObj = createMessage(contact, message, status);

    return messageObj;
}

// ! ************************************************************************
// ! ** VUE *****************************************************************
// ! ************************************************************************

const app = Vue.createApp({
    name: 'Boolzapp',
    data() {
        return {
            data,
            activeContactId: 0,
            isTyping: 0,
            newMessage: '',
            contactSearchWord: '',
            messageMenu: [],
            notifications: false
        }
    },

    // COMPUTED
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
            return this.contacts.find(({ id }) => id === this.activeContactId);
        },

    },

    // METHODS
    methods: {
        isActiveContact(id) {
            return id === this.activeContactId;
        },

        setActiveId(id) {
            this.activeContactId = id;
        },

        unsetActiveContact() {
            this.activeContactId = 0;
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
            this.activeContact.messages = this.activeContact.messages.filter(message => message.id !== id);
        },

        activateNotifications() {
            this.notifications = true;
        },

        sendMessage() {
            const message = this.newMessage;

            if (!message) return;

            const status = 'sent';
            const justSentMessage = createMessage(this.activeContact, message, status);

            this.activeContact.messages.push(justSentMessage);

            this.newMessage = '';

            this.renderResponse();
        },


        async renderResponse() {
            this.isTyping = this.activeContactId;

            const response = await getResponse(this.user.name, this.activeContact);

            this.activeContact.messages.push(response);
            this.isTyping = 0;
        }
    },

    mount() {

    }

});

app.mount('#root');