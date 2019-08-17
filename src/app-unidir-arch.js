'use strict';

const createSetNameAction = name => ({
    type: 'SET_NAME',
    name
})

const createStore = model => {
    
    const listeners = []

    const addListener = listener => {
        listeners.push(listener)
    }

    const notifyListeners = () => {
        listeners.forEach(l => l())
    }

    return {
        get model() {
            return model
        },
        notifyListeners,
        addListener
    }
}

const createLogicHandler = store => {
    const handleAction = action => {
        switch (action.type) {
            case 'SET_NAME': {
                store.model.name = action.name
                break;
            }
            default: break;
        }
        store.notifyListeners()
    }

    return {
        handleAction
    }
}

const createDispatcher = logicHandler => action => {
    logicHandler.handleAction(action)
}

// the model
const createModel = () => {
    return {
        name: ''
    }
}

// the store handling the model
const store = createStore(createModel())

// the logic handler unit - "logic layer"
const logic = createLogicHandler(store)

// the dispatcher to be used by our view layer
const dispatcher = createDispatcher(logic)

// the "view layer"
class App {
    constructor(store, dispatcher, domEl) {
        this.store = store
        this.dispatcher = dispatcher
        this.domEl = domEl

        this.store.addListener(this.handleOnChange.bind(this))
        this.render({name: this.store.model.name})
    }

    handleOnChange() {
        this.render({name: this.store.model.name})
    }

    updateName() {
        this.dispatcher(createSetNameAction('It is: ' + new Date().toISOString()))
    }

    render({name}) {
        const frag = document.createDocumentFragment()
        const nameBox = document.createElement('div')
        nameBox.innerText = name
        const nameBoxStyle = {
            display: 'block',
            width: '400px',
            height: '120px',
            background: 'red',
            color: 'white',
            border: '1px solid black',
            fontSize: '1.6rem',
            textAlign: 'center'
        }
        Object.assign(nameBox.style, nameBoxStyle)
        const button = document.createElement('button')
        button.innerText = 'Check the time'
        button.onclick = () => this.updateName()

        frag.append(nameBox, button)
        this.domEl.innerHTML = ''
        this.domEl.append(frag)
    }
}

const createApp = (dispatcher, store, domElement) => {
    const app = new App(store, dispatcher, domElement)
    return app
}


const myApp = createApp(dispatcher, store, document.getElementById('root'))