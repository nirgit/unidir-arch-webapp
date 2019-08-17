'use strict';

const dom = elType => document.createElement(elType)

const createModel = () => {
    return {
        name: 'Alexander Smith',
        size: '1.2' //in rem
    }
}

const createModelWrapper = jsModel => {
    function observeModelDeep(observer, root) {
        if (!root || typeof root !== 'object') return
        for (let propName in root) {
            if (root.hasOwnProperty(propName)) {
                observeModelDeep(observer, root[propName])
            }
        }
        return new Proxy(root, observer)
    }

    const listeners = []
    const notifyAll = () => {
        listeners.forEach(l => l())
    }
    const notifyAllHandler = {
        set(target, propName, value) {
            target[propName] = value
            notifyAll()
            return true
        }
    }

    const observedModel = observeModelDeep(notifyAllHandler, jsModel)

    return {
        addListener(listener) {
            listeners.push(listener)
        },
        get model() {
            return observedModel
        }
    }
}

const createNameInputView = domEl => {
    domEl.innerHTML = `
    <label for="name">Your signature:</label><input id="name" type="text" />
    <label for="fontsize">size:</label><input id="fontsize" type="range" min=1 max=4 value=1.5 step=0.2 />
    `

    return {
        setName(name) {
            domEl.querySelector('#name').value = name
        },
        addNameChangeListener(listener) {
            domEl.querySelector('#name').addEventListener('keyup', listener)
        },
        addFontSizeListener(listener) {
            domEl.querySelector('#fontsize').addEventListener('input', listener)
        }
    }
}

const createNameInputPresenter = (modelWrapper, nameInputView) => {

    nameInputView.setName(modelWrapper.model.name)
    nameInputView.addNameChangeListener(event => {
        modelWrapper.model.name = event.target.value
    })
    nameInputView.addFontSizeListener(event => {
        modelWrapper.model.size = event.target.value
    })
}


const createSignatureListView = domEl => {
    domEl.innerHTML = `
    <style>
        ul > li {
            margin-bottom: 1.2rem;
            list-style: none;
            border-bottom: 1px solid #eee;
            max-width: 300px;
        }
    </style>
    <ul id='siglist'>
        <li style="font-family: cursive"></li>
        <li style="font-family: fantasy"></li>
        <li style="font-family: Aerotis"></li>
        <li style="font-family: Amanda"></li>
        <li style="font-family: Allison-Tessa"></li>
    </ul>
    `

    return {
        setFontSize(sizeInRem) {
            const lst = domEl.querySelector('#siglist')
            lst.style.fontSize = sizeInRem + 'rem'
        },
        setSignature(name) {
            const lst = domEl.querySelector('#siglist')
            Array.from(lst.children).forEach(child => {
                child.innerText = name
            })
        }
    }
}

const createSignaturesListPresenter = (modelWrapper, view) => {
    // update the view
    view.setSignature(modelWrapper.model.name)
    view.setFontSize(modelWrapper.model.size)

    // listen to the model
    modelWrapper.addListener(() => {
        view.setSignature(modelWrapper.model.name)
        view.setFontSize(modelWrapper.model.size)
    })
}


const createAppPresenter = (modelWrapper, domRootEl) => {
    function startInputPresenter() {
        const inputViewSectionDomEl = dom('div')
        const nameInputView = createNameInputView(inputViewSectionDomEl)
        createNameInputPresenter(modelWrapper, nameInputView)
        return inputViewSectionDomEl
    }

    function startSignaturesListPresenter() {
        const sigListViewDomEl = dom('div')
        const sigListView = createSignatureListView(sigListViewDomEl)
        createSignaturesListPresenter(modelWrapper, sigListView)
        return sigListViewDomEl
    }

    domRootEl.append(startInputPresenter())
    domRootEl.append(startSignaturesListPresenter())
}


createAppPresenter(createModelWrapper(createModel()), document.getElementById('root'))