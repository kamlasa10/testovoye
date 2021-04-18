@@include('./libs.js');

// global variables

const avaliablesCurrency = {
    eur: '€',
    usd: '$',
    gbr: '£',
    aud: '$',
    cad: '$'
}

window.currentCurrency = 'eur'
let totalPrice = {
    total: 0,
    choisonCells: {}
}

function changeCurrentCurrency(target) {
    const price = target.text().slice(1)

    return avaliablesCurrency[window.currentCurrency] + price
}

function changeCurrency() {
    $('.js-cell').each(function() {
        const $this = $(this)

        const newText = changeCurrentCurrency($this)

        $this.text(newText)
    })

    $('.js-table-prices__info-total sup').text(avaliablesCurrency[window.currentCurrency])
}

changeCurrency()

// Tabs Class

class Tabs {
    constructor(tabs, content, activeClass) {
        this.tabs = $(tabs)
        this.content = $(content)
        this.activeClass = activeClass

        this.init()
    }

    changeTabById(id = 1, fn) {
        this.tabs.removeClass(this.activeClass)

        $(`[data-tab="${id}"]`).addClass(this.activeClass)

        if(fn) {
            fn(id)
            return
        }

        this.content.hide()

        // if dont have another content
        if(+id > 1) {
            $(`[data-tab-content="${1}"]`).fadeIn(300)
            return
        }

        $(`[data-tab-content="${id}"]`).fadeIn(300)
    }

    init() {
        this.tabs.each((_, item) => {
            $(item).on('click', () => {
                const id = $(item).data().tab

                this.changeTabById(id)
            })
        })

        this.changeTabById()
    }
}

class TabsCurrency extends Tabs{
    constructor(tabs, content, activeClass) {
        super(tabs, content, activeClass);
    }

    changeCurrencyValue(id) {
        const currency = $(`.choise__currency[data-tab="${id}"]`).data().currency
        window.currentCurrency = currency

        changeCurrency()
    }

    changeTabById = (id = 1) => {
        super.changeTabById(id, this.changeCurrencyValue)
    }
}

new Tabs('.js-tabs__btn', '.js-tabs__content-item', 'active')
new TabsCurrency('.js-choise__currency', null, 'current')

// Logic Choise Select

$('.js-choise__select').each(function() {
    const childs = $(this).find('.js-select-dropdown__item')

    $(this).on('click', (e) => {
        e.preventDefault()
        $('.js-choise__select').removeClass('show')

        const $target = $(e.target)
        const selectId = $(this).data().select

        if($target.hasClass('js-select-dropdown__item')) {
            const value = $($target).text()

            childs.removeClass('current')
            $target.addClass('current')
            $(`[data-select-currency="${selectId}"]`).text(value)
            $(this).removeClass('show')
            return
        }

        $(this).toggleClass('show')
    })
})

// header moving

$(window).on('scroll', () => {
    if(document.documentElement.scrollTop > 0) {
        $('.header').addClass('moving')
        return
    }

    $('.header').removeClass('moving')
})

// logic choise cells

function choiseCurrentPlan(target) {
    const cellId = target.data().cell

    $(`[data-cell="${cellId}"]`).each(function() {
        $(this).find('.js-cell').removeClass('current')
    })
    target.find('.js-cell').addClass('current')
}

let prevChoiseCell = {
    target: null,
    price: null,
    cellId: null
}

function calculateTotalPrice() {
    const total = Object.values(totalPrice.choisonCells).reduce((acc, next) => acc + next, 0)

    $('.js-table-prices__total').text(total)
}

$('.js-table-prices').find('input').each(function() {
    this.addEventListener('change', (e) => {
        const parent = $(this).closest('[data-cell]')
        const cellId = parent.data().cell
        const price = parseFloat(($(this).next().text().slice(1)))

        // if(prevChoiseCell && prevChoiseCell.target !== this || cellId !== prevChoiseCell.cellId) {
        //     totalPrice -= prevChoiseCell.price
        // }

        $(`[data-cell="${cellId}"]`).find('input').each(function() {
            if(e.currentTarget === this) return
            $(this).prop('checked', false)
        })

        if(!$(this).prop('checked') && $(this).data().choise) {
            $(this).prop('checked', false)
            $(this).attr('data-choise', false)
            totalPrice.choisonCells[cellId] = 0
            calculateTotalPrice()

            return
        }

        $(this).attr('data-choise', true)

        totalPrice.choisonCells[cellId] = price

        prevChoiseCell.target = this
        prevChoiseCell.price = price
        prevChoiseCell.cellId = cellId

        calculateTotalPrice()
    })
})

