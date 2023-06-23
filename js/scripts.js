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
            messageSearchWord: '',
            messageMenu: [],
            notifications: false,
            isSearchingMsg: false,
            contactMenu: false
        }
    },

    // COMPUTED
    computed: {
        user() {
            const { name, avatar } = this.data.user;
            return { name, avatar: `img/avatar${avatar}.jpg` };
        },

        // remaps the contact array, lastMessage is used to display last message text and date the contacts list
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

        filteredMessagesBySearch() {
            const searchedWord = this.messageSearchWord.toLowerCase();
            return this.activeContact.messages.filter(({ message }) => message.toLowerCase().includes(searchedWord));
        },

        activeContact() {
            return this.contacts.find(({ id }) => id === this.activeContactId);
        },

    },

    // METHODS
    methods: {

        //  Every contact in the contacts list calls this function to know if he is the current active, if he is a css class will the contact a background
        isActiveContact(id) {
            return id === this.activeContactId;
        },

        setActiveId(id) {
            this.activeContactId = id;
        },

        // unset the active contact, it is needed because when there is no active contact on smartphones the contact page will be displayed
        unsetActiveContact() {
            this.activeContactId = 0;
        },

        // it has a timeout because since clicking on the message menu list is also clicking on the chat window, and a click on the chat window closes the message menu, che closing of the message menu needs to be delayed to allow the click on the list to be registered.
        hideAllMessageMenus() {
            setTimeout(() => {
                this.messageMenu = this.messageMenu.map(elem => elem = false)
            }, 50);
        },

        // since the hidAllMessageMenus function has a timeout, this function also needs a timeout; it closes all the other message menus, waits 1th of a second and then show the clicked one
        showMessageMenu(i) {
            this.hideAllMessageMenus();
            setTimeout(() => {
                this.messageMenu[i] = true
            }, 100);
        },

        toggleContactMenu() {
            this.contactMenu = !this.contactMenu;
        },

        hideContact() {
            this.activeContact.visible = false;
            this.toggleContactMenu();
        },

        deleteMessage(id) {
            this.activeContact.messages = this.activeContact.messages.filter(message => message.id !== id);
        },

        // hides the notification button
        activateNotifications() {
            this.notifications = true;
        },

        /**
         * scrolls page to last message
         */
        scrollPage() {
            this.$nextTick(() => {
                this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight;
            })
        },

        toggleSearchMsg() {
            this.isSearchingMsg = !this.isSearchingMsg;
        },

        /**
         * Logs the message and scrolls the page 
         * @param {object} contact the contact we are chatting with
         * @param {object} message the obj with the message to send
         */
        send(contact, message) {
            contact.messages.push(message);
            this.scrollPage();
        },

        sendUserMessage() {
            const message = this.newMessage;

            if (!message) return;

            const status = 'sent';
            const justSentMessage = createMessage(this.activeContact, message, status);

            this.send(this.activeContact, justSentMessage);

            this.newMessage = '';
            this.sendResponse();

        },

        async sendResponse() {
            this.isTyping = this.activeContactId;

            const message = await getResponse(this.user.name, this.activeContact);

            const status = 'received';
            const response = createMessage(this.activeContact, message, status);

            this.send(this.activeContact, response);

            this.isTyping = 0;

        }
    },

    mount() {

    }

});

app.mount('#root');


// ! ************************************************************************
// ! ** LOGIC OUTSIDE *******************************************************
// ! ************************************************************************

// APY_KEY will read the value KEY in the auth.js, if there is no KEY or auth.js file API_KEY will assume a value of false, to be handled later before making an api request
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

/**
 * Mounts different datas in an object representing the message that can be added to the contact's messages array
 * @param {object} contact the current active contact
 * @param {string} message the message text
 * @param {string} status the message status: sent or received
 * @returns {object} the message to be added
 */
const createMessage = (contact, message, status) => {
    const id = getMessageId(contact);
    const date = getCurrentTime();
    return { id, message, status, date };
}

/**
 * The actual API call
 * @param {object} payload
 * @returns {string} the actual response or error message
 */
async function makeRequest(payload) {
    const url = 'https://api.openai.com/v1/chat/completions';

    let message = '';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + APY_KEY
            }
        });

        const jsonResponse = await response.json();

        // we handle the response, if status is 200 the response will be chatgpt actual message, otherwise the response will be an error message with the status code
        if (response.status === 200) {
            message = jsonResponse.choices[0].message.content;
        } else {
            throw new Error(jsonResponse.error.message);
        }
    } catch (e) {
        message = e.message;
    }

    return message;
}


/**
 * Get the chat gpt response
 * @param {string} userName the user's name
 * @param {object} contact the current active contact
 * @returns returns the response text, ready to be mounted in the message object
 */
async function getGptResponse(userName, contact) {

    // initialize chatgpt chat history to be sent to chatgpt for context;
    // first object in the array is the initial prompt with the instructions for chatgpt
    const completeChat = [{
        role: "system",
        content: `Fingiamo una conversazione whatsapp, user si chiama ${userName} e assistant ${contact.name}, ricordati di fingere una versa persona e non un language model`
    }];

    // completes the array to send to chatgpt mounting our messages obj in a format that chatgpt accepts
    contact.messages.forEach(({ message, status }) => {
        const role = status === 'sent' ? 'user' : 'assistant';
        completeChat.push({ role, content: message });
    });

    // makes the request and returns the text
    return await makeRequest({
        temperature: 0.9,
        model: 'gpt-3.5-turbo',
        messages: completeChat
    })
};

/**
 * Generates a response, if an API KEY is found it will ask chatgpt to generate a coherent answer to our message, otherwise it will return a message with the instructions to get the key
 * @param {string} userName user's name
 * @param {object} contact the current active contact
 * @returns {string} the message text
 */
async function getResponse(userName, contact) {

    // The default message with instruction on how to get and 'install' a key
    let message = `Non è stata rilevata nessuna API KEY per chat GPT, quindi non potrà rispondere.<br>
    Per poter attivare chatGPT creare un file auth.js nella cartella JS ed inserire la propria chiave in una variabile con il nome KEY.<br><br>
    Per ottenere una API Key per OpenAI devi seguire questi passaggi: 1. Vai sul sito di OpenAI 2. Clicca sul pulsante "Sign Up for GPT-3" 3. Inserisci il tuo indirizzo email e premi su "Get Access" 4. Compila il form con le informazioni richieste e seleziona il tipo di utilizzo che intendi fare della piattaforma 5. Premi "Apply" 6. Dovresti ricevere un'email di risposta con le istruzioni per accedere alla dashboard di OpenAI e ottenere la tua API Key Spero di esserti stato utile!`;

    // if an api key is found it will ask chatgpt to generate a response
    if (APY_KEY) {
        message = await getGptResponse(userName, contact);
    }

    return message;
}
