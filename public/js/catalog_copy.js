jQuery.extend(jQuery.expr[':'], {
    invalid: function (elem, index, match) {
        var invalids = document.querySelectorAll(':invalid'),
            result = false,
            len = invalids.length;

        if (len) {
            for (var i = 0; i < len; i++) {
                if (elem === invalids[i]) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }
});


//Почему бы и нет?
/**
 * @param {string} s1 Исходная строка
 * @param {string} s2 Сравниваемая строка
 * @param {object} [costs] Веса операций { [replace], [replaceCase], [insert], [remove] }
 * @return {number} Расстояние Левенштейна
 */
function levenshtein(s1, s2, costs) {
    var i, j, l1, l2, flip, ch, chl, ii, ii2, cost, cutHalf;
    l1 = s1.length;
    l2 = s2.length;

    costs = costs || {};
    var cr = costs.replace || 1;
    var cri = costs.replaceCase || costs.replace || 1;
    var ci = costs.insert || 1;
    var cd = costs.remove || 1;

    cutHalf = flip = Math.max(l1, l2);

    var minCost = Math.min(cd, ci, cr);
    var minD = Math.max(minCost, (l1 - l2) * cd);
    var minI = Math.max(minCost, (l2 - l1) * ci);
    var buf = new Array((cutHalf * 2) - 1);

    for (i = 0; i <= l2; ++i) {
        buf[i] = i * minD;
    }

    for (i = 0; i < l1; ++i, flip = cutHalf - flip) {
        ch = s1[i];
        chl = ch.toLowerCase();

        buf[flip] = (i + 1) * minI;

        ii = flip;
        ii2 = cutHalf - flip;

        for (j = 0; j < l2; ++j, ++ii, ++ii2) {
            cost = (ch === s2[j] ? 0 : (chl === s2[j].toLowerCase()) ? cri : cr);
            buf[ii + 1] = Math.min(buf[ii2 + 1] + cd, buf[ii] + ci, buf[ii2] + cost);
        }
    }
    return buf[l2 + cutHalf - flip];
}

// let ajax_cart = false;

$(document).ready(function () {
    const selector_product_container = '[data-product_container]';
    const selector_product_counter = '[data-product_counter]';
    const selector_product_total = '[data-product_total_price]';
    const selector_product_price_label = '[data-product_price_label]';
    const selector_cart_container = '[data-product_cart_container]';
    const selector_cart_page = '[data-cart_page]';
    const selector_not_empty_cart = '[data-bind="not_empty_cart"]';
    const selector_empty_cart = '[data-bind="empty_cart"]';
    //сумма зказа без доставки
    const selector_cart_total = '[data-bind="cart.total"]';
    //сумма зказа вместе с доставкой
    const selector_cart_total_all = '[data-bind="cart.total_all"]';
    const widget_cart_total = '[data-bind="widget.cart.total"]';

    const api_url = '/api/';

    const cart_required_delivery_id = 1;

    let total_sum_1 = 0;
    let bonus_max_1 = 0;

    let ymaps_delivery_avaliable = true;
    let ymaps_delivery_discard_delivery_reason = '';
    let ymaps_delivery_min_price = 0;
    let ymaps_delivery_price_modifier = 0;

    //get cart
    async function get_cart() {
        let formData = new FormData;
        formData.append('action', 'get');
        formData.append('user', js_cart['user']);
        formData.append('sid', js_cart['sid']);

        let response = await fetch(api_url + 'cart', {
            method: 'POST',
            body: formData,
        });

        ajax_cart = await response.json();

        return await ajax_cart;
    }

    function update_pizza_count(product_container, only_count = false) {

        let p_id = product_container.data('product_id');
        let p_am = get_applied_modifiers(product_container);

        let p_cnt = get_product_count(p_id, p_am);

        p_cnt.then((count) => {
            update_product_count(p_id, p_am, count);

            if (!only_count) {
                if (count > 0) {
                    show_pizza_controls(product_container);
                } else {
                    hide_pizza_controls(product_container);
                }
            }
        });
    }

    //конпка в корзину переключающая выбор теста и диаметра
    let product_show_modifiers_button = $('.product-get');
    if (!product_show_modifiers_button.length) {
        try {
            $('select[name^=modifier]')
                .triggerHandler('change.modifier_change')
                .triggerHandler('change.modifier_kombo_change');
        } catch (e) {

        }
    }
    product_show_modifiers_button.on('click', function (e) {
        e.preventDefault();

        let product_container = $(this).closest('[data-product_container]');
        let product_front = product_container.find('.product-front');
        let product_back = product_container.find('.product-back');

        if (product_back.length > 0) {
            product_front.hide();
            product_back.show();

            product_container.find('.product-price').show();
            product_container.find('.product-get').hide();
            product_container.find('.product-add').show();
            product_container.find('.product-incr').hide();
            try {
                product_container.find('select[name^=modifier]').triggerHandler('change.modifier_change');
                product_container.find('select[name^=modifier]').triggerHandler('change.modifier_kombo_change');
            } catch (e) {

            }

            let modifier_value_button = product_container.find('[data-size_option_active]:visible');
            apply_pizza_modifier(product_container, modifier_value_button);
            update_pizza_count(product_container);

            //close handler
            product_container.find('.product-back__arrow').on('click.close_pizza', function (e) {
                e.preventDefault();

                product_container.find('.product-back__arrow').off('click.close_pizza');

                product_front.show();
                product_back.hide();

                product_container.find('.product-price').show();
                product_container.find('.product-get').show();
                product_container.find('.product-add').hide();
                product_container.find('.product-incr').hide();
            })
        }
    });

    //применить выбранный модификатор
    function apply_pizza_modifier(product_container, modifier_value_button, only_count = false) {

        let modifier_id = modifier_value_button.data('modifier_id');
        let modifier_value_id = modifier_value_button.data('modifier_value_id');
        let modifier_price = modifier_value_button.data('modifier_price');
        let modifier_weight = modifier_value_button.data('modifier_weight');
        let modifier_size = modifier_value_button.data('modifier_size');

        let modifier = product_container.find(`[name="modifier[${modifier_id}]"]`);

        modifier.find(`option[value="${modifier_value_id}"]`).prop('selected', true);
        product_container.find('[data-product_price_label]').html(modifier_price);
        product_container.find('[data-product_weight_label]').html(modifier_weight);
        product_container.find('[data-product_size_label]').html(modifier_size);
        product_container.data('product_full_price', product_container.data('product_price') + modifier_price);

        update_pizza_count(product_container, only_count);
    }

    //выбрать тип теста
    $('[data-size_selector]').on('click', function (e) {
        e.preventDefault();

        let product_container = $(this).closest('[data-product_container]');
        let size_selectors = product_container.find('[data-size_selector]');
        let size = $(this).data('size_selector');
        let el_container = product_container.find('[data-size]').hide().filter(`[data-size="${size}"]`);

        size_selectors.removeClass('product-type--active');
        size_selectors.removeClass('card-type__el--active');
        $(this).addClass('product-type--active');
        $(this).addClass('card-type__el--active');
        el_container.show();

        let modifier_value_button = el_container.find('[data-size_option_active]');

        apply_pizza_modifier(product_container, modifier_value_button)
    });

    //выбрать диаметр пиццы
    $('[data-size_option]').on('click', function (e) {
        e.preventDefault();

        let product_container = $(this).closest('[data-product_container]');

        let modifier_value_button = $(this);
        let modifier_value_button_container = modifier_value_button.closest('[data-size]');

        modifier_value_button_container.find('[data-size_option]')
            .removeClass('product-size__el--active')
            .removeClass('card-size__el--active')
            .removeAttr('data-size_option_active')
            .filter(modifier_value_button)
            .addClass('product-size__el--active')
            .addClass('card-size__el--active')
            .attr('data-size_option_active', true);

        apply_pizza_modifier(product_container, modifier_value_button)
    });

    //показать кнопки +- пиццы
    function show_pizza_controls(product_container) {
        let a = product_container.find('[data-product_control_add]');
        let b = product_container.find('[data-product_control_inc]');
        if (a.length && b.length) {
            a.hide();
            b.show();
        }
    }

    //убарть кнопки +- пиццы
    function hide_pizza_controls(product_container) {
        let a = product_container.find('[data-product_control_add]');
        let b = product_container.find('[data-product_control_inc]');
        if (a.length && b.length) {
            a.show();
            b.hide();
        }
    }

    //получить примененный модификаторы
    function get_applied_modifiers(product_container) {
        product_container = $(product_container);

        let active_modifiers = product_container.find('[name^="modifier"]');
        let required = active_modifiers.filter('[required]');
        let required_check = required.filter(function (index) {
            let modifier = $(this);
            let dom = modifier.get()[0];

            if (modifier.is(':invalid')) return true;

            else if (dom.tagName === "SELECT"
                && dom.multiple === true
                && dom.dataset.modifier_max != [...dom.selectedOptions].length) return true;

            else return false;
        });

        if (active_modifiers.length) {
            return {
                'required': !!required.length,
                'required_check': !!required.length && 0 === required_check.length,
                'required_invalid': required_check.get(),
                'found': active_modifiers.get()
                    .filter(tag => {
                        return tag.tagName !== '';
                    })
                    .reduce((found, dom) => {
                        let modifier;
                        if (dom.tagName === "SELECT") {
                            modifier = [...dom.selectedOptions].map(option => {
                                return {
                                    'modifier_id': dom.name.match(/\[(.*)\]/)[1],
                                    'modifier_value_id': option.value,
                                    'modifier_price': typeof option.dataset.modifier_price !== "undefined" ? option.dataset.modifier_price : 0,
                                }
                            });

                            return [...found, ...modifier]
                        } else {
                            modifier = {
                                'modifier_id': dom.name.match(/\[(.*)\]/)[1],
                                'modifier_value_id': dom.value,
                                'modifier_price': typeof dom.dataset.modifier_price !== "undefined" ? dom.dataset.modifier_price : 0,
                            };

                            return [...found, modifier]
                        }

                    }, [])
            }
        } else if (product_container.data('has_applied_modifiers')) {
            let modifiers = product_container.data('has_applied_modifiers');

            return {
                'found': modifiers,
                'required': true,
                'required_check': true,
            };
        } else if (required.length) return {
            'found': false,
            'required': !!required.length,
            'required_check': required.length === required_check.length,
        };
        else return {
                'found': false,
                'required': false,
                'required_check': false,
            };
    }

    function compare_modifiers(_m1, _m2) {
        function compare_modifier_values(m1_val, m2_val) {
            return parseInt(m1_val['modifier_id']) === parseInt(m2_val['modifier_id'])
                && parseInt(m1_val['modifier_value_id']) === parseInt(m2_val['modifier_value_id'])
        }

        let m1 = _m1['found'];
        let m2 = _m2['found'];

        if ((m1.length === 0 && m2.length === 0) || (!m1 && !m2)) return true;

        if (m1.length !== m2.length) return false;

        let match_counter = 0;
        for (let i = 0, exclude_j = []; i < m1.length; i++) {
            let found_flag = false;

            for (let j = 0; j < m2.length; j++) {
                if (exclude_j.indexOf(j) === -1 && compare_modifier_values(m1[i], m2[j])) {
                    exclude_j.push(j);
                    match_counter++;
                    found_flag = true;
                    break;
                }
            }

            //if not found in row then return
            if (found_flag === false) return false;
        }

        return match_counter === m1.length;

        // return m1.length && m1.length === m2.length && m1.every((m1_val) => {
        //     return m2.some((m2_val) => {
        //         return parseInt(m1_val['modifier_id']) === parseInt(m2_val['modifier_id'])
        //             && parseInt(m1_val['modifier_value_id']) === parseInt(m2_val['modifier_value_id'])
        //     })
        // })
    }

    //добавить товар
    function add_product(event) {
        event.preventDefault();
        ym(71554075,'reachGoal','add');
        let product_container = $(this).closest(selector_product_container);
        let product_id = product_container.data('product_id');
        let applied_modifiers = get_applied_modifiers(product_container);

        if (applied_modifiers.required && !applied_modifiers.required_check) {
            alert("Выберите модификаторы!");
            return false;
        }


        $.ajax({
            url: api_url + 'cart',
            async: true,
            data: {
                method: 'cart',
                product_id: product_id,
                applied_modifiers: applied_modifiers,
                action: 'plus',
                user: js_cart['user'],
                sid: js_cart['sid']
            },
            method: "POST",
            beforeSend: function () {
            },
            success: function (data) {
                ajax_cart.cart = data.cart;
                update_product_count(product_id, applied_modifiers, data.amount);
                update_product_price(product_id, applied_modifiers, data.amount);

                //не показывать кнопки на главной
                if (window.location.pathname !== '/') {
                    show_pizza_controls(product_container);
                }

                // todo-aidar работа с промо 
                if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                    check_promocode(localStorage.getItem('promocode'));
                    console.log('добавить товар')
                }
            }
        });
    }
    //добавить товар
    function filter_product(event) {
        event.preventDefault();
        if($(this).hasClass('activeFilter')){
            $('.activeFilter').removeClass('activeFilter');

            $(this).parent('.filtersProducts').parent('.main_products').children('.product_list').children('.main_prod').show();
        }
        else{
            $('.activeFilter').removeClass('activeFilter');
            $(this).addClass('activeFilter');
            let filter_id = $(this).data('filter_id');
            let cat_id = $(this).parent('.filtersProducts').parent('.main_products').data('cat_id');
            $.ajax({
                url: api_url + 'filter',
                async: true,
                data: {
                    method: 'filter',
                    char_id: filter_id,
                    category_id: cat_id
                },
                method: "POST",
                beforeSend: function () {
                },
                success: function (data) {
                    let json_data = JSON.parse(data);
                    alert(json_data);

                    $(this).parent('.filtersProducts').parent('.main_products').children('.product_list').children('.main_prod').hide()
                    $.each(json_data, function(index, value){
                        $('.main_products').find('[data-product_id=' + value + ']').show();
                    });
                }
            });
            // $(this).parent('.filtersProducts').parent('.main_products').children('.product_list').children('.main_prod').hide();
        }


        /*
        let product_container = $(this).closest(selector_product_container);
        let applied_modifiers = get_applied_modifiers(product_container);

        if (applied_modifiers.required && !applied_modifiers.required_check) {
            alert("Выберите модификаторы!");
            return false;
        }
        */



    }

    //добавить товар в корзине
    function add_product_in_cart(event) {
        event.preventDefault();

        let product_container = $(this).closest(selector_product_container);
        let product_id = product_container.data('product_id');
        let applied_modifiers = get_applied_modifiers(product_container);

        if (applied_modifiers.required && !applied_modifiers.required_check) {
            alert("Выберите модификаторы!");
            return false;
        }


        $.ajax({
            url: api_url + 'cart',
            async: true,
            data: {
                method: 'cart',
                product_id: product_id,
                applied_modifiers: applied_modifiers,
                action: 'plus',
                user: js_cart['user'],
                sid: js_cart['sid']
            },
            method: "POST",
            beforeSend: function () {
            },
            success: function (data) {
                ajax_cart.cart = data.cart;
                update_product_count(product_id, applied_modifiers, data.amount);
                update_product_price(product_id, applied_modifiers, data.amount);

                //не показывать кнопки на главной
                if (window.location.pathname !== '/') {
                    show_pizza_controls(product_container);
                }

                // todo-aidar работа с промо
                if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                    check_promocode(localStorage.getItem('promocode'));
                    console.log('добавить товар')
                }
            }
        });
    }

    //прибавить товар
    function inc_product(event) {
        event.preventDefault();

        let product_container = $(this).closest(selector_product_container);
        let product_id = product_container.data('product_id');
        let applied_modifiers = get_applied_modifiers(product_container);

        if (applied_modifiers.required && !applied_modifiers.required_check) {
            alert("Выберите модификаторы!");
            return false;
        }

        $.ajax({
            url: api_url + 'cart',
            async: true,
            data: {
                method: 'cart',
                product_id: product_id,
                applied_modifiers: applied_modifiers,
                action: 'plus',
                user: js_cart['user'],
                sid: js_cart['sid']
            },
            method: "POST",
            beforeSend: function () {
            },
            success: function (data) {
                ajax_cart.cart = data.cart;
                update_product_count(product_id, applied_modifiers, data.amount);
                update_product_price(product_id, applied_modifiers, data.amount);
                show_pizza_controls(product_container);

                // todo-aidar работа с промо
                if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                    check_promocode(localStorage.getItem('promocode'));
                    console.log('прибавить товар')
                }
            }
        });
    }

    //удалить товар
    function del_product(event) {
        event.preventDefault();

        let product_container = $(this).closest(selector_product_container);
        let product_id = product_container.data('product_id');
        let applied_modifiers = get_applied_modifiers(product_container);

        let cart_container = product_container.closest(selector_cart_container);

        $.ajax({
            url: api_url + 'cart',
            async: true,
            data: {
                method: 'cart',
                product_id: product_id,
                applied_modifiers: applied_modifiers,
                action: 'minus',
                user: js_cart['user'],
                sid: js_cart['sid']
            },
            method: "POST",
            beforeSend: function () {

            },
            success: function (data) {
                ajax_cart.cart = data.cart;
                update_product_count(product_id, applied_modifiers, data.amount);
                update_product_price(product_id, applied_modifiers, data.amount);


                if (parseInt(data.amount) === 0) {
                    if (typeof product_container.attr('data-product_cart_container') !== 'undefined') {
                        product_container.remove();

                        get_total_count().then((count) => {
                            if (count === 0) {
                                $(selector_not_empty_cart).hide();
                                $(selector_empty_cart).show();
                            }
                        })
                    } else
                        hide_pizza_controls(product_container);
                }


                // todo-aidar работа с промо при уменьшении товара
                if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                    check_promocode(localStorage.getItem('promocode'));
                    console.log('удаление товара')
                }
            }
        });
    }

    //
    async function get_product_count(product_id, applied_modifiers = false) {
        if (!ajax_cart) ajax_cart = await get_cart();

        let pr = false;

        ajax_cart['cart'].find((product) => {
            if (parseInt(product.id) !== parseInt(product_id)) return false;

            let cond = product.values.find((value) => {
                console.log({'found': value.modifiers});
                console.log(applied_modifiers);
                console.log(compare_modifiers({'found': value.modifiers}, applied_modifiers));

                return compare_modifiers({'found': value.modifiers}, applied_modifiers)
            });
            if (typeof cond !== 'undefined') {
                pr = cond.amount;
                return true;
            } else {
                return false;
            }
        });

        return pr;
    }

    async function get_total_count() {
        if (!ajax_cart) ajax_cart = await get_cart();

        return typeof ajax_cart['cart'] === 'object'
            ? ajax_cart['cart']
                .reduce((values, item) => [...values, ...item.values], [])
                .reduce((sum, value) => sum + value.amount, 0)
            : 0;
    }

    function get_delivery_method() {

        // let select_delivery = $('#confirm_delivery option:selected').val();
        let select_delivery = $('.delivery_button.active').data('delivery_id');
        if (select_delivery) return select_delivery;
        // let button_delivery = $('.delivery_button.active').data('delivery_id');
        // if (button_delivery) return button_delivery;
    }

    function get_takeaway_terminal_name() {
        return $('#takeaway_terminal option:selected').val();
    }

    function get_takeaway_terminal_id() {
        return $('#takeaway_terminal option:selected').html();
    }

    function get_payment_method() {
        let select_payment = $('#confirm_payment option:selected').val();
        if (select_payment) return select_payment;
        let button_payment = $('.payment_button.active').data('payment_id');
        if (button_payment) return button_payment;
    }

    function get_product_price(product_container) {
        if (product_container.data('product_full_price')) {
            return parseFloat(product_container.data('product_full_price'));
        } else if (product_container.data('product_price')) {
            return parseFloat(product_container.data('product_price'));
        } else {
            return false;
        }
    }

    function get_total_price_in_cart() {
        let product_containers = $(selector_cart_container);

        return product_containers.get().reduce((prev, dom) => {
            let p_c = $(dom);
            return parseFloat(p_c.find(selector_product_total).html()) + prev;
        }, 0);
    }

    async function get_total_price() {
        // return await get_cart().cart
        //     .reduce((values, item) => [values, ...item.values], [])
        //     .reduce((sum, value) => sum + value.product_price, 0);
    }


    function update_product_price(product_id, applied_modifiers, new_count) {
        let product_containers = $(selector_product_container);

        product_containers = product_containers.filter((i) => {
            return parseInt(product_containers[i].dataset.product_id) === parseInt(product_id)
                && compare_modifiers(applied_modifiers, get_applied_modifiers(product_containers[i]))
        });

        product_containers.each((i, dom) => {
            let p_c = $(dom);
            p_c.find(selector_product_total).html(new_count * get_product_price(p_c));
        });

        if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
            check_promocode(localStorage.getItem('promocode'));
        } else {
            update_total_price();
        }


    }

    function update_product_count(product_id, applied_modifiers, new_count) {
        let product_containers = $(selector_product_container);

        product_containers = product_containers.filter((i) => {
            return parseInt(product_containers[i].dataset.product_id) === parseInt(product_id)
                && compare_modifiers(applied_modifiers, get_applied_modifiers(product_containers[i]))
        });

        product_containers.find(selector_product_counter).html(new_count);
    }

    function update_total_price(total_discount, total_discount_type) {
        // let product_containers = $(selector_cart_container);
        //
        // let total = product_containers.get().reduce((prev, dom) => {
        //     let p_c = $(dom);
        //     return parseFloat(p_c.find(selector_product_total).html()) + prev;
        // }, 0);

        $.ajax({
            'type': 'POST',
            'url': api_url + 'cart',
            'data': {
                "action": "get_total_sum",
                "sid": js_cart.sid,
            },
            'success': function (data) {
                let total = data.status === 'ok' ? data.sum : 0;

                //TODO-aidar-2
                if (total_discount && total_discount_type) {
                    if (total_discount_type === 'percent') {
                        total = Math.round(total - total / 100 * total_discount);

                        $(selector_cart_total).html(total);
                        $(widget_cart_total).html(total);
                    }

                } else if (total_discount && !total_discount_type) {
                    total = Number(total) + Number(total_discount);
                    $(selector_cart_total).html(total);
                    $(widget_cart_total).html(total);
                } else {
                    $(selector_cart_total).html(total);
                    $(widget_cart_total).html(total);
                }

                if (parseInt(total) !== 0) {
                    $(widget_cart_total).parent().show();
                } else {
                    $(widget_cart_total).parent().hide();
                }

                total_sum_1 = Number(total);
                update_user_bonus();

            },
        });
    }

    function update_total_price_in_cart() {
        let total = get_total_price_in_cart();

        $(selector_cart_total_all).html(total + ymaps_delivery_price_modifier);
    }


    let update_user_bonus_timer = false;

    // $(document).ready(function () {
    //     $('#Payment_tab1_open_1').hide();
    // });

    $(document).ready(function () {
        let count = $('#person_count');
        let plusBtn = $('#person_count_p');
        let minusBtn = $('#person_count_m');

        plusBtn.click(function () {
            count.val(parseInt(count.val()) + 1);
        });
        minusBtn.click(function () {
            if (parseInt(count.val()) !== 1) {
                count.val(parseInt(count.val()) - 1);
            }

        });

    });

    // количество персон (десктоп)
    $('.person_count-d').on('change', function () {
        if ($(this).val() > 50) {
            $(this).val('50');
        } else if ($(this).val() < 1) {
            $(this).val('1');
        }
    })


    function update_user_bonus() {
        let bonus = $('[data-bonus_label]');
        let bonus_field = $('#payment_bonus');
        let user_phone = $('#confirm_phone').val();
        if (!update_user_bonus_timer) {
            update_user_bonus_timer = true;

            setTimeout(() => {
                update_user_bonus_timer = false;

                $.ajax({
                    'type': 'POST',
                    'url': api_url + 'user',
                    'data': {
                        "action": "get",
                        // "id": js_cart.user,
                        "phone": user_phone,
                    },
                    'success': function (data) {
                        if (data.status === 'ok') {
                            bonus.html(data.bonus);


                            if (data.bonus > 0) {
                                // проверка бонусов и суммы заказа
                                let bonus_max = 0;

                                if (data.bonus > total_sum_1) {
                                    bonus_max = total_sum_1;
                                } else {
                                    bonus_max = data.bonus;
                                }
                                bonus_field.attr('max', bonus_max);

                                if (document.getElementById('payment_bonus_max')) {
                                    document.getElementById('payment_bonus_max').innerHTML = bonus_max;
                                }

                                //Показать бонусы
                                bonus_field.removeAttr('disabled');
                                $('.cart_bonus').show();

                                //Ползунок с бонусными баллами в мобайл
                                if (document.getElementById('volume')) {
                                    let volumeSlider = document.getElementById('volume');
                                    let sliders = [volumeSlider];

                                    function Slider(slider) {
                                        this.slider = slider;

                                        slider.addEventListener('input', function () {
                                            this.updateSliderOutput();
                                            this.updateSliderLevel();
                                        }.bind(this), false);

                                        this.level = function () {
                                            let level = this.slider.querySelector('.slider-input');
                                            return level.value;
                                        }

                                        this.levelString = function () {
                                            return parseInt(this.level());
                                        }

                                        this.remaining = function () {
                                            return 100 - (100 - 100 * this.level() / bonus_max);
                                        }

                                        this.remainingString = function () {
                                            return parseInt(this.remaining());
                                        }

                                        this.updateSliderOutput = function () {
                                            let output = this.slider.querySelector('.slider-output');
                                            let remaining = this.slider.querySelector('.slider-remaining');
                                            let thumb = this.slider.querySelector('.slider-thumb');
                                            output.value = this.levelString();
                                            output.style.left = this.remainingString() + '%';
                                            thumb.style.left = this.remainingString() + '%';

                                            if (remaining) {
                                                remaining.style.width = this.remainingString() + '%';
                                            }
                                        }

                                        this.updateSlider = function (num) {
                                            let input = this.slider.querySelector('.slider-input');
                                            input.value = num;
                                        }

                                        this.updateSliderLevel = function () {
                                            let level = this.slider.querySelector('.slider-level');
                                            level.style.width = this.remainingString() + '%';
                                        }
                                    }

                                    sliders.forEach(function (slider) {
                                        new Slider(slider);
                                    });
                                }

                                // Изменение суммы заказа (минус бонусы)
                                $('.payment_bonus-d').on('change', function () {
                                    if (data.bonus > total_sum_1) {
                                        bonus_max = total_sum_1;
                                    } else {
                                        bonus_max = data.bonus;
                                    }

                                    if ($(this).val() > bonus_max) {
                                        $(this).val(bonus_max);
                                    } else if ($(this).val() < 0) {
                                        $(this).val('0');
                                    }

                                    $('[data-bind="cart.total"]').text(total_sum_1 - $(this).val());
                                })

                            } else {
                                bonus_field.attr('disabled', 'disabled');
                                $('.cart_bonus').hide();
                            }
                            // $('#bonus_count').attr('max', bonus);

                        }
                    },
                });
            }, 500);
        }
    }

    if ($('[data-bonus_label]').textContent = 0) {
        $('#payment_bonus').style = "display: none";
    }

    function get_current_stage() {
        return $('[data-confirm_stage]:visible').data('confirm_stage');
    }

    function confirm_go_stage1(event) {
        event.preventDefault();

        $('[data-confirm_stage]').hide();
        $('[data-confirm_stage="1"]').show();
        update_user_bonus()
        $(document).scrollTop(0);
    }

    function confirm_go_stage2(event) {
        event.preventDefault();
        ym(71554075,'reachGoal','reg');
        
        // if (parseInt(js_cart.user) === 0) {
        //     $('[data-confirm_stage]').hide();
        //     $('[data-confirm_stage="auth"]').show();
        //     return false;
        // }

        //init infa pro usera


        $('[data-confirm_stage], [data-confirm_auth]').hide();
        $('[data-confirm_stage="2"]').show();
        update_user_bonus();
        $(document).scrollTop(0);

        if ($('#promo').hasClass('promocode_empty')) {
            $('#promo').val('').trigger('change');
        }
    }

    function confirm_go_stage3(event) {
        event.preventDefault();

        let name = $('#confirm_first_name').val();
        let phone = $('#confirm_phone').val();
        let email = $('#confirm_email').val();
        let delivery = get_delivery_method();
        let payment = get_payment_method();

        let takeaway_terminal_name = get_takeaway_terminal_name();
        let takeaway_terminal_id = get_takeaway_terminal_id();

        let city = $('#delivery_city').val();
        let street = $('#delivery_street').val();
        let home = $('#delivery_home').val();
        let housing = '';
        let apartment = $('#delivery_apartment').val();
        let porch = $('#delivery_porch').val();
        let floor = $('#delivery_floor').val();

        let intercom = $('#delivery_intercom').val();
        let address_name = $('#delivery_name').val();
        let address_comment = $('#delivery_comment').val();

        let comment = $('#confirm_comment').val();
        let payment_bonus = Number($('#payment_bonus').val());
        let payment_bonus_max = $('#payment_bonus').attr('max');
        let promo = $('#promo').val();

        let person_count = $('#person_count').val();

        let confirm_cash = '';
        if (($('#change_consent').prop("checked") || $('.payment_button.active').data('payment_id') !== 5)) {
            confirm_cash = '0';
        } else {
            confirm_cash = $('#confirm_cash').val();
        }

        let order_time = '';
        if ($('#order_time').val() === 'Ближайшее время' || $('#order_time').val() === 'Завтра в ближайшее время' || $('#order_time').val() === null) {
            order_time = 0;
        } else {
            let date = new Date();
            let year = date.getFullYear();

            let month = date.getMonth() + 1;
            if (month < 10) month = '0' + month;

            let day = date.getDate();
            if (day < 10) day = '0' + day;

            order_time = year + '-' + month + '-' + day + ' ' + $('#order_time').val();
        }


        let payment_token = 1;//todo get_payment_token();

        let total_sum = 1;//todo get_total_sum(false);

        let use_redirect_enter_card = false;

        //check form
        if ((!name || !delivery || !payment) ||
            (delivery == cart_required_delivery_id && (!city || !street || !home))) {
            alert(name + ', пожалуйста заполните все поля формы заказа.');
            // modal_alert.find('.alert-msg').html('Пожалуйста заполните все поля формы заказа.');
            // modal_alert.modal('open');
            return false;
        }

        //check form
        if (delivery == cart_required_delivery_id && !ymaps_delivery_avaliable) {
            if (ymaps_delivery_discard_delivery_reason === 'out_of_zone')
                alert('Введенный адрес не входит ни в одну из зон доставки.');
            else if (ymaps_delivery_discard_delivery_reason === 'min_sum')
                alert('В данную зону доставка возможна только от суммы ' + ymaps_delivery_min_price + ' рублей.');

            return false;
        }

        //check form
        if (payment_bonus > payment_bonus_max) {
            alert('У вас недостаточно бонусов для списания.');
            return false;
        }


        if (get_current_stage() !== 'wait_for_redirect' && !payment_token) {
            $('[data-confirm_stage]').hide();
            $('[data-confirm_stage="3"]').show();
            $(document).scrollTop(0);
        }

        let all_products = $(selector_cart_container).find(selector_product_container);
        let order_items = [];

        all_products.each((i, product) => {
            product = $(product);
            let product_data = {
                "id": product.data('product_id'),
                "name": product.data('product_clear_name'),
                "values": []
            };
            let modifiers = get_applied_modifiers(product);
            if (modifiers.found && !(modifiers.required && !modifiers.required_check)) {
                product_data.values.push({
                    "modifiers": modifiers.found,
                    "amount": get_product_count(product),
                });
            } else {
                product_data.values.push({
                    "amount": get_product_count(product),
                });
            }
            if (order_items[product.data('product_id')]) {
                order_items[product.data('product_id')].values.push(product_data.values.pop());
            } else {
                order_items[product.data('product_id')] = product_data;
            }
        });

        let request_data = {
            "method": "confirm",
            "sid": js_cart.sid,
            "user": js_cart.user,

            "payment_status": "not_paid",

            "name": name,
            "phone": phone,
            "email": email,

            "delivery": delivery,
            "payment": payment,

            "delivery_city": city,
            "delivery_street": street,
            "delivery_home": home,
            "delivery_housing": housing,
            "delivery_apartment": apartment,

            "delivery_entrance": porch,
            "delivery_floor": floor,
            "delivery_doorphone": intercom,

            "terminal": takeaway_terminal_name,
            "terminal_id": takeaway_terminal_id,

            "balls": payment_bonus,

            "promo": promo,
            "payment_token": payment_token,
            "comment": comment,

            "person_count": person_count,
            "confirm_cash": confirm_cash,
            "order_time": order_time,

            "order_items": order_items,
        };
        if(name==null) request_data=0;
        if(request_data!=0){
            $.ajax({
                'type': 'POST',
                'url': api_url + 'confirm',
                'data': request_data,
                'beforeSend': function (e) {
                    if (use_redirect_enter_card) {
                        //data-confirm_stage="wait_for_redirect"
                        $(document).scrollTop(0);
                        $('[data-confirm_stage]').hide();
                        $('[data-confirm_stage="wait_for_redirect"]').show();
                        console.log(order_time);
                    }
                },
                'success': function (data) {
                    if (data.status === 'ok') {

                        //todo-aidar
                        if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                            localStorage.removeItem('promocode');
                            localStorage.removeItem('promocode_type');
                        }
                        sessionStorage.removeItem('address_street');
                        sessionStorage.removeItem('address_home');

                        $(document).scrollTop(0);
                        $('[data-bind="cart.order_id"]').html(data.order_id);

                        $('[data-confirm_stage]').hide();
                        $('[data-confirm_stage="3"]').show();


                        // cart_dot_blink();
                        // cart_widget_update();
                    }
                    /*else if (data.status === 'order_not_found') {
                        if (yandexCheckout) yandexCheckout.close();

                        $('[data-confirm_stage]').hide();
                        $('[data-confirm_stage="2"]').show();

                        modal_alert.find('.alert-msg').html('Произошла ошибка. Попробуйте отправить заказ позднее.');
                        modal_alert.modal('open');

                        cart_dot_blink();
                        cart_widget_update();
                    }*/
                    else if (data.status === 'payment.succeeded') {
                        console.log(data);

                        // todo-aidar работа с промо при успехе заказа
                        if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                            localStorage.removeItem('promocode');
                            localStorage.removeItem('promocode_type');
                        }
                        sessionStorage.removeItem('address_street');
                        sessionStorage.removeItem('address_home');

                        $('[data-confirm_stage]').hide();
                        $('[data-confirm_stage="3"]').show();
                        $('[data-bind="cart.order_id"]').html(data.order_id);
                        $('[data-bind="cart.success_title"]').html(`Платеж успешно завершен. Спасибо за ваш заказ.`);
                        yandexCheckout.close();
                        cart_dot_blink();
                        cart_widget_update();
                    } else if (data.status === 'payment.pending') {

                        // todo-aidar работа с промо при успехе заказа
                        if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                            localStorage.removeItem('promocode');
                            localStorage.removeItem('promocode_type');
                        }
                        sessionStorage.removeItem('address_street');
                        sessionStorage.removeItem('address_home');

                        // let confirm_popup = window.open(
                        //     data.payment.confirmation.confirmation_url,
                        //     'yandexCheckout',
                        //     // 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300,left=100,top=100'
                        // );
                        // let check_confirm_popup = setInterval(() => {
                        //     try {
                        //         if (confirm_popup.window.payment) {
                        //             clearInterval(check_confirm_popup);
                        //
                        //             const payment = confirm_popup.window.payment;
                        //
                        //             if (payment.status == 'succeeded') {
                        //                 yandexCheckout.close();
                        //                 $(document).scrollTop(0);
                        //                 $('[data-confirm_stage]').hide();
                        //                 $('[data-confirm_stage="3"]').show();
                        //                 $('[data-bind="cart.order_id"]').html(payment.metadata.order_id);
                        //             }
                        //             else if (payment.status == 'canceled') {
                        //                 let reason = payment.cancellation_details.reason;
                        //                 let description = 'Неизвестная ошибка';
                        //                 switch (reason) {
                        //                     case '3d_secure_failed':              description = "Не пройдена аутентификация по 3-D Secure."; break;
                        //                     case 'call_issuer':                   description = "Оплата данным платежным средством отклонена по неизвестным причинам."; break;
                        //                     case 'card_expired':                  description = "Истек срок действия банковской карты."; break;
                        //                     case 'country_forbidden':             description = "Нельзя заплатить банковской картой, выпущенной в этой стране."; break;
                        //                     case 'fraud_suspected':               description = "Платеж заблокирован из-за подозрения в мошенничестве."; break;
                        //                     case 'general_decline':               description = "Причина не детализирована."; break;
                        //                     case 'identification_required':       description = "Превышены ограничения на платежи для кошелька в Яндекс.Деньгах."; break;
                        //                     case 'insufficient_funds':            description = "Не хватает денег для оплаты."; break;
                        //                     case 'invalid_card_number':           description = "Неправильно указан номер карты."; break;
                        //                     case 'invalid_csc':                   description = "Неправильно указан код CVV2 (CVC2, CID)."; break;
                        //                     case 'issuer_unavailable':            description = "Организация, выпустившая платежное средство, недоступна."; break;
                        //                     case 'payment_method_limit_exceeded': description = "Исчерпан лимит платежей для данного платежного средства или вашего магазина."; break;
                        //                     case 'payment_method_restricted':     description = "Запрещены операции данным платежным средством."; break;
                        //                     case 'permission_revoked':            description = "Нельзя провести безакцептное списание."; break;
                        //                 }
                        //                 yandexCheckout.showLantern(description);
                        //             }
                        //             else {
                        //                 yandexCheckout.close();
                        //             }
                        //             cart_dot_blink();
                        //             cart_widget_update();
                        //         }
                        //     }
                        //     catch (e) {
                        //
                        //     }
                        // }, 100);
                        document.location.href = data.payment.confirmation.confirmation_url;
                    } else if (data.status === 'payment.waiting_for_capture') {

                        // todo-aidar работа с промо при успехе заказа
                        if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                            localStorage.removeItem('promocode');
                            localStorage.removeItem('promocode_type');
                        }
                        sessionStorage.removeItem('address_street');
                        sessionStorage.removeItem('address_home');

                        $('[data-confirm_stage]').hide();
                        $('[data-confirm_stage="3"]').show();
                        cart_dot_blink();
                        cart_widget_update();
                    } else if (data.status === 'payment.canceled') {
                        let reason = data.cancellation_details.reason;
                        let description = 'Неизвестная ошибка';
                        switch (reason) {
                            case '3d_secure_failed':
                                description = "Не пройдена аутентификация по 3-D Secure.";
                                break;
                            case 'call_issuer':
                                description = "Оплата данным платежным средством отклонена по неизвестным причинам.";
                                break;
                            case 'card_expired':
                                description = "Истек срок действия банковской карты.";
                                break;
                            case 'country_forbidden':
                                description = "Нельзя заплатить банковской картой, выпущенной в этой стране.";
                                break;
                            case 'fraud_suspected':
                                description = "Платеж заблокирован из-за подозрения в мошенничестве.";
                                break;
                            case 'general_decline':
                                description = "Причина не детализирована.";
                                break;
                            case 'identification_required':
                                description = "Превышены ограничения на платежи для кошелька в Яндекс.Деньгах.";
                                break;
                            case 'insufficient_funds':
                                description = "Не хватает денег для оплаты.";
                                break;
                            case 'invalid_card_number':
                                description = "Неправильно указан номер карты.";
                                break;
                            case 'invalid_csc':
                                description = "Неправильно указан код CVV2 (CVC2, CID).";
                                break;
                            case 'issuer_unavailable':
                                description = "Организация, выпустившая платежное средство, недоступна.";
                                break;
                            case 'payment_method_limit_exceeded':
                                description = "Исчерпан лимит платежей для данного платежного средства или вашего магазина.";
                                break;
                            case 'payment_method_restricted':
                                description = "Запрещены операции данным платежным средством.";
                                break;
                            case 'permission_revoked':
                                description = "Нельзя провести безакцептное списание.";
                                break;
                        }
                        yandexCheckout.chargeFailful(description);
                    } else if (data.status === 'order_not_found') {
                        if (yandexCheckout) yandexCheckout.close();

                        $('[data-confirm_stage]').hide();
                        $('[data-confirm_stage="2"]').show();

                        modal_alert.find('.alert-msg').html('Произошла ошибка. Попробуйте отправить заказ позднее.');
                        modal_alert.modal('open');

                        cart_dot_blink();
                        cart_widget_update();
                    } else {
                        console.log(data);
                        // if (yandexCheckout) yandexCheckout.close();

                        $('[data-confirm_stage]').hide();
                        $('[data-confirm_stage="2"]').show();

                        // modal_alert.find('.alert-msg').html('Произошла ошибка. Попробуйте отправить заказ позднее.');
                        // modal_alert.modal('open');
                        //
                        // cart_dot_blink();
                        // cart_widget_update();
                    }


                },
            });
        }


        // ----- Сохранение адреса -----
        let select_address = $('#delivery_select_address').val();
        let select_delivery = $('[data-delivery_id="1"]');
        // Если выбрано "Доставка" и "Введите новый адрес
        if (select_delivery.hasClass('active') && select_address === 'enter') {
            //Проверка нового адреса
            let request_data_address1 = {
                "action": "get_address",
                "id": js_cart.user,
            }
            $.ajax({
                'type': 'POST',
                'url': api_url + 'user',
                'data': request_data_address1,
                'success': function (data) {
                    let coin = 0;
                    (data).forEach(function (item) {
                        if (item.street.includes(street) && item.home.includes(home) && item.apartment.includes(apartment)) {
                            coin++
                        }
                    })
                    // Если Адреса (улица, дом, кв) нет в БД
                    if (coin === 0) {
                        let request_data_address2 = {
                            "action": "add_address",
                            "id": js_cart.user,

                            'address_name': address_name,
                            'address_comment': address_comment,

                            "city": city,
                            "street": street,
                            "home": home,
                            "housing": '',
                            "apartment": apartment,

                            "porch": porch,
                            "floor": floor,
                            "intercom": intercom,
                        }

                        $.ajax({
                            'type': 'POST',
                            'url': api_url + 'user',
                            'data': request_data_address2,
                            'success': function (data) {

                            },
                        });
                    }
                },
            });
        }
    }


// ---------- ---------- ---------- Выбор сохраненного адреса в оформлении - десктоп ---------- ---------- ----------
    function change_delivery_address() {
        let address = $('#delivery_select_address').find($('option:selected')).attr('data-value');

        if (address === 'enter') {
            $('.input-address').show();
        } else {
            $('.input-address').hide();
            address = JSON.parse(address);

            $('#delivery_street').val(address.street);
            $('#select2-delivery_street-container')
                .attr('title', address.street)
                .text(address.street);
            $('#delivery_home').val(address.home);
            $('#delivery_porch').val(address.porch);
            $('#delivery_floor').val(address.floor);
            $('#delivery_apartment').val(address.apartment);

            $('#delivery_intercom').val(address.intercom);
            $('#delivery_name').val(address.name);
            $('#delivery_comment').val(address.comment);

        }
    }

// ---------- ---------- ---------- Выбор сохраненного адреса в оформлении - мобилка ---------- ---------- ----------

    let new_address_flag = '';
    function change_delivery_address_m() {
        let address = $(this).attr('data-value');
        address = JSON.parse(address);

        $('#delivery_street').val(address.street).trigger('change');
        $('#delivery_home').val(address.home).trigger('change');
        $('#delivery_porch').val(address.porch);
        $('#delivery_floor').val(address.floor);
        $('#delivery_apartment').val(address.apartment);

        $('#delivery_intercom').val(address.intercom);
        $('#delivery_name').val(address.name);
        $('#delivery_comment').val(address.comment);

        $('.delivery-new-address-streethome').text('ул. '+ address.street + ' ' + address.home).css('color', 'black');
        new_address_flag = false;
    }
    $('[data-address_new]').click(function () {
        if (new_address_flag === false) {
            $('#delivery_street').val('').trigger('change');
            $('#delivery_home').val('').trigger('change');
            $('#delivery_porch').val('');
            $('#delivery_floor').val('');
            $('#delivery_apartment').val('');

            $('#delivery_intercom').val('');
            $('#delivery_name').val('');
            $('#delivery_comment').val('');

            $('.delivery-new-address-streethome').text('Введите адрес').css('color', '#aaa');
            new_address_flag = true;
        }

    })
    $('[data-address_new_save]').click(function (e) {
        if (!$('.input-address input').val() || $('.input-address input').val() === '') {
            alert('Необходимо заполнить поля');
            e.stopPropagation()
        } else {
            $('.delivery-new-address-streethome')
                .text('ул. ' + $('#delivery_street').val() + ' ' + $('#delivery_home').val())
                .css('color', 'black');
            $('[data-close_first_modal]').trigger('click')
        }

    })




    function confirm_go_stage_auth(event) {
        event.preventDefault();
        $(document).scrollTop(0);
        $('[data-confirm_stage]').hide();
        $('[data-confirm_stage="auth"]').show();
    }

    function confirm_go_stage_reg(event) {
        event.preventDefault();
        $(document).scrollTop(0);
        $('[data-confirm_stage]').hide();
        $('[data-confirm_stage="reg"]').show();
    }

    function confirm_auth(event)            /* todo */ {
        event.preventDefault();
        $(document).scrollTop(0);

        let request_data = {
            "method": "phone_onetime.auth",
            "sid": js_cart.sid,
            "user": js_cart.user,
            "stage": 1,
            "phone": $('#confirm_auth_phone').val(),
        };

        $('#confirm_phone').val($('#confirm_auth_phone').val());

        $.ajax({
            'type': 'POST',
            'url': api_url + 'auth',
            'data': request_data,
            'success': function (data) {
                if (data.status === 'ok') {
                    $('[data-confirm_stage]').hide();
                    $('[data-confirm_stage="confirm_auth"]').show();
                } else if (data.status === 'need_reg') {
                    let request_data = {
                        "method": "phone_onetime.reg",
                        "sid": js_cart.sid,
                        "user": js_cart.user,
                        "stage": 1,
                        "phone": $('#confirm_auth_phone').val(),
                        "user_name": $('#confirm_first_name').val(),
                    };

                    $.ajax({
                        'type': 'POST',
                        'url': api_url + 'auth',
                        'data': request_data,
                        'success': function (data) {
                            if (data.status === 'ok') {
                                $('[data-confirm_stage]').hide();
                                $('[data-confirm_stage="confirm_reg"]').show();
                            } else {
                                alert('Произошла ошибка. Попробуйте отправить заказ позднее.');
                            }
                        },
                    });
                } else {
                    alert('Произошла ошибка. Попробуйте отправить заказ позднее.');
                }
            },
        });
    }

    function confirm_confirm_auth(event)    /* todo */ {
        event.preventDefault();
        $(document).scrollTop(0);

        let request_data = {
            "method": "phone_onetime.confirm_auth",
            "sid": js_cart.sid,
            "user": js_cart.user,
            "stage": 2,
            "phone": $('#confirm_auth_phone').val(),
            "onetime_token": $('#confirm_auth_code').val(),
        };

        $.ajax({
            'type': 'POST',
            'url': api_url + 'auth',
            'data': request_data,
            'success': function (data) {
                if (data.status === 'ok') {
                    js_cart.user = data.user_id;
                    $('#confirm_first_name').val(data.user_name);
                    // alert(data.user_name);
                    $('[data-confirm_stage]').hide();
                    confirm_go_stage2(event);
                } else if (data.status === 'invalid_code') {
                    alert('Неверный код.');
                } else {
                    alert('Произошла ошибка. Попробуйте отправить заказ позднее.');

                }
            },
        });
    }

    function confirm_reg(event)             /* todo */ {
        event.preventDefault();
        $(document).scrollTop(0);

        let request_data = {
            "method": "phone_onetime.reg",
            "sid": js_cart.sid,
            "user": js_cart.user,
            "stage": 1,
            "phone": $('#confirm_auth_phone').val(),
            "user_name": $('#confirm_reg_name').val(),
        };

        $.ajax({
            'type': 'POST',
            'url': api_url + 'auth',
            'data': request_data,
            'success': function (data) {
                if (data.status === 'ok') {
                    $('[data-confirm_stage]').hide();
                    $('[data-confirm_stage="confirm_reg"]').show();
                } else {
                    alert('Произошла ошибка. Попробуйте отправить заказ позднее.');

                }
            },
        });
    }

    function confirm_confirm_reg(event)     /* todo */ {
        event.preventDefault();
        $(document).scrollTop(0);

        let request_data = {
            "method": "phone_onetime.confirm_reg",
            "sid": js_cart.sid,
            "user": js_cart.user,
            "stage": 2,
            "phone": $('#confirm_auth_phone').val(),
            "onetime_token": $('#confirm_reg_code').val(),
        };

        $.ajax({
            'type': 'POST',
            'url': api_url + 'auth',
            'data': request_data,
            'success': function (data) {
                if (data.status === 'ok') {
                    js_cart.user = data.user_id;
                    $('[data-confirm_stage]').hide();
                    confirm_go_stage2(event);
                } else if (data.status === 'invalid_code') {
                    alert('Неверный код.');
                } else {
                    alert('Произошла ошибка. Попробуйте отправить заказ позднее.');
                }
            },
        });
    }

    function confirm_enter_card(event)      /* todo */ {
        event.preventDefault();
        $(document).scrollTop(0);

        const checkout = YandexCheckout(yandex_kassa_shopId, {
            language: 'ru'
        });
        let number = document.querySelector('[data-card_input="number"]').value.replace(/[^0-9]/g, '');
        let cvc = document.querySelector('[data-card_input="cvc"]').value.replace(/[^0-9]/g, '');
        let month = document.querySelector('[data-card_input="expiry_month"]').value.replace(/[^0-9]/g, '');
        let year = document.querySelector('[data-card_input="expiry_year"]').value.replace(/[^0-9]/g, '');

        checkout.tokenize({
            number: number,
            cvc: cvc,
            month: month,
            year: year
        }).then(res => {
            console.log(res);
            if (res.status === 'success') {
                const {paymentToken} = res.data.response;
                return paymentToken;
            } else if (res.status === 'error') {
                if (typeof res.error.message === "undefined" && res.error.params.length > 0) {
                    res.error.message = res.error.params[0].message;
                }
                modal_alert.find('.alert-msg').html(res.error.message);
                modal_alert.modal('open');
            }
        }).then(paymentToken => {
            console.log(paymentToken);
            set_payment_token(paymentToken);
            confirm_go_stage3(event);
        });

        $('[data-confirm_stage]').hide();
        $('[data-confirm_stage="wait_for_redirect"]').show();
        $(document).scrollTop(0);
    }

    function cart_widget_update() {
        function escapeHTMLEncode(str) {
            let div = document.createElement('div');
            let text = document.createTextNode(str);
            div.appendChild(text);
            return div.innerHTML;
        }

        let cart_widget_container = cart_widget.find('.cart_widget-container');
        if (cart_widget_container.length == 0) cart_widget_container = cart_widget;
        $.ajax({
            url: api_url,
            async: true,
            data: {
                method: 'get_cart',
                user: js_cart['user'],
                sid: js_cart['sid']
            },
            method: "POST",
            beforeSend: function () {
                if (!cart_widget.data('loaded')) {
                    cart_widget.data('loaded', true);
                    cart_widget_container.children().hide();
                    cart_widget.find('.cart_widget-loader').show();
                } else {

                }

                cart_widget_container.children().not('[data-empty_cart="true"], .cart_widget-loader, .cart_widget-confirm').show();
                if (parseInt(js_cart['user']) === 0) {                                             //.cart_widget-more_products ,
                    //not authorized
                    cart_widget.find('[data-auth="true"]').hide();
                    cart_widget.find('[data-auth="false"]').show();
                } else {
                    cart_widget.find('[data-auth="true"]').show();
                    cart_widget.find('[data-auth="false"]').hide();
                }
            },
            success: function (data) {
                let cart;
                if (data.cart) cart = data.cart;
                else cart = [];

                let count = 0;
                let total_count = 0;
                let total = 0;
                let total_sum_widget = 0;
                let products_container = cart_widget.find('.cart_widget-products');
                products_container.empty();

                cart_widget.find('.cart_widget-loader').hide();


                //cart is assoc array
                Object.entries(cart).map(([, value]) => value).forEach(product => {
                    count++;

                    Object.entries(product.values).map(([, value]) => value).forEach(value => {

                        total_count += value.amount;
                        total += parseFloat(value.product_price) * value.amount;

                        //if (count <= 3) {
                        let modifiers = value.modifiers ? value.modifiers.map(mv => {
                            return {'modifier_id': mv.modifier_id, 'modifier_value_id': mv.modifier_value_id,}
                        }) : false;
                        let data_has_applied_modifiers = modifiers ? `data-has_applied_modifiers='${escapeHTMLEncode(JSON.stringify(modifiers))}'` : '';


                        //sort: modifier with id = 2 must be first

                        value.modifiers = typeof value.modifiers === 'object' ? value.modifiers : [];
                        let modifiers_composite_name =
                            [...value.modifiers].sort((_, a) => 2 - a.modifier_id).map(modifier => {


                                if (parseInt(modifier.modifier_id) === 2) {
                                    return `<span class="vertlinecart">|</span><b> ${modifier.value_short_name}</b>`;
                                } else {
                                    return `<span class="vertlinecart">|</span> ${modifier.value_short_name}`;
                                }
                            }).join(' ');


                        let cart_widget_product__title;
                        if (modifiers)
                            cart_widget_product__title = `<b>${product.name}</b> <!--<span class="vertlinecart"> |</span>-->  ${modifiers_composite_name}<!--<span class="vertlinecart">|</span>-->`;

                        else
                            cart_widget_product__title = `<b>${product.name}</b><!--<span class="vertlinecart">|</span>-->`;

                        if (modifiers_composite_name) {
                            total_sum_widget += parseFloat(value.product_price) * value.amount;
                        }
                        products_container.append(
                            `<div class="cart_widget_product" ${data_has_applied_modifiers} data-product_container data-product="${product.id}">
                                    <a class="cart_widget_product__image" href="${product.url}">
<!--                                        <div class="cart_widget_product__image">-->
                                            <img src="${value.product_photo}" alt="">
<!--                                        </div>-->
                                    </a>
                                    <div class="cart_widget_product__body ">
                                        <a class="cart_widget_product__title" href="${product.url}"><h3>${cart_widget_product__title}</h3></a>
                                        <div class="cart_widget_product__controls">
                                            <button type="button" class="cart_del_btn cart-minus">
                                                 <img src="/assets/images/icons/minus.svg">
                                            </button>
                                            <div class="cart_widget_product__count">${value.amount}</div>
                                            <button type="button" class="cart_add_btn cart-plus">
                                                 <img src="/assets/images/icons/plus.svg">
                                            </button>                                
                                            <div class="cart_widget_product__total-price">${parseFloat(value.product_price) * value.amount} руб</div>
                                        </div>
                                    </div>
                                </div>`);
                        // products_container.append('<div class="cart_widget_product">' +
                        //     '<img src="'+value.product_photo+'" alt="">' +
                        //     '<h3><span style="display: block">'+value.amount+' шт х '+value.product_price+' руб</span>'+value.composite_name+'</h3>' +
                        //     '</div>');
                        // }
                    })
                });

                $('[data-bind="cart.count"]').html(parseInt(count) === 0 ? '' : `${count}`);
                $('[data-bind="cart.total_count"]').html(parseInt(total_count) === 0 ? '' : `(${total_count})`);
                // $('[data-bind="cart.total_price"]').html(parseFloat(total) === 0 ? '0' : `(${total})`);
                //products in cart exists
                $('.cart_widget-more_products').hide();
                if (count) {
                    $('.cart_widget-confirm').show();
                    $('[data-empty_cart="true"]').hide();
                    $('[data-empty_cart="false"]').show();
                    // $('.cart_widget-more_products').hide();

                    $('[data-total_widget]').html(`<b>${total_count}</b> ${declOfNum(total_count, ['товар', 'товара', 'товаров'])} на сумму <b>${total} руб</b>`)
                }
                //no products in cart
                else {
                    $('[data-empty_cart="true"]').show();
                    $('[data-empty_cart="false"]').hide();
                    $('.cart_widget-more_products').hide();

                    cart_page_clear();
                }
                // if (count > 3) {
                //     $('.cart_widget-more_products').show();
                //     $('[data-bind="cart.more_products"]').html(count - 3);
                // }
                // else {
                //     $('.cart_widget-more_products').hide();
                // }
            }
        });
        //update favorite info
        let favorite = get_favorite();
        /*favorite.then((response)=>{
            if (response.favorite.length > 0)
                $('[data-bind="favorite.count"]').html(`(${response.favorite.length})`);
            else
                $('[data-bind="favorite.count"]').html('');
        })*/
    }


    function show_product_bg_photo(e) {
        e.preventDefault();
        $('.widthly').addClass('fullpic');
    }

    function hide_product_bg_photo(e) {
        e.preventDefault();
        $('.widthly').removeClass('fullpic');
    }


    //При выборе модификаторов комбо обновлять скрытый модификатор бесплатной пиццыы
    function update_kombo_pizza_modifier(e) {
        function visible_select_filter(i) {
            try {
                return $(this).data('modifier_name').indexOf('2+1') !== -1
                    && $(this).data('modifier_name').indexOf('бесплатная пицца') === -1;
            } catch (e) {
                return false;
            }
        }

        function hidden_select_filter(i) {
            try {
                return $(this).data('modifier_name').indexOf('бесплатная пицца') !== -1;
            } catch (e) {
                return false;
            }
        }

        let select = $($(this));
        let product_container = select.closest(selector_product_container);
        let free_pizza_selector_wrapper = product_container.find('.free_pizza_selector_wrapper');
        let free_pizza_selector = free_pizza_selector_wrapper.find('select');

        function set_pizza_option(hidden_select, modifier_value_name) {
            let needle_option = hidden_select.find('option').removeAttr('selected').filter(function (i) {
                return 3 > levenshtein($(this).data('modifier_value_name'), modifier_value_name);
            });
            needle_option.prop('selected', true);
            hidden_select.triggerHandler('change.modifier_change');
        }

        if (select.data('modifier_name').indexOf('2+1') !== -1) {
            let selected_options = product_container.find('select').filter(visible_select_filter).find('option:selected');
            let hidden_select = product_container.find('select').filter(hidden_select_filter);

            if (selected_options.length !== 2) return true;

            if (selected_options.eq(0).data('modifier_price') === selected_options.eq(1).data('modifier_price')
                && selected_options.eq(0).data('modifier_value_name') !== selected_options.eq(1).data('modifier_value_name')) {

                let free_pizza_selector_options = free_pizza_selector.find('option');

                free_pizza_selector_options.eq(0)
                    .html(selected_options.eq(0).data('modifier_value_name'))
                    .val(selected_options.eq(0).data('modifier_value_name'));

                free_pizza_selector_options.eq(1)
                    .html(selected_options.eq(1).data('modifier_value_name'))
                    .val(selected_options.eq(1).data('modifier_value_name'));

                free_pizza_selector_wrapper.removeAttr('hidden');
                free_pizza_selector.select2({
                    width: '100%',
                    placeholder: 'Выберите одну из двух бесплатных пицц',
                    minimumResultsForSearch: Infinity,
                });
                free_pizza_selector.on('change.free_pizza', function (e) {
                    let modifier_value_name = $(this).find('option:selected').val();

                    setTimeout(() => {
                        set_pizza_option(hidden_select, modifier_value_name)
                    });
                });
            } else {
                free_pizza_selector_wrapper.attr('hidden', 'hidden');
                try {
                    free_pizza_selector.select2('destroy');
                } catch (e) {

                }
                free_pizza_selector.off('change.free_pizza');

                let selected_option = selected_options.eq(0).data('modifier_price') < selected_options.eq(1).data('modifier_price')
                    ? selected_options.eq(0)
                    : selected_options.eq(1);

                // setTimeout(()=>{set_pizza_option(hidden_select, selected_option.data('modifier_value_name'))});
                set_pizza_option(hidden_select, selected_option.data('modifier_value_name'));
            }
        }

        return true;
    }

    $(document).ready(show_delivery_block_1);

    function show_delivery_block_1() {
        $('[data-delivery_block="1"]').show();
    };

    //ui
    function update_delivery_fields() {

        // let delivery_method = get_delivery_method();
        let delivery_method = $(this).data('delivery_id');
        // let select_delivery = $('.delivery_button.active').data('delivery_id');
        // if (select_delivery) return select_delivery;
        // let delivery_method = get_delivery_method();

        $('[data-delivery_block]').hide().filter(`[data-delivery_block="${delivery_method}"]`).show();
        //$('[data-delivery_block="1"]').show();


    }


    //pre init
    update_user_bonus();
    update_total_price();

    $('.js-modifier-select').select2({
        width: '100%',
        minimumResultsForSearch: Infinity,
        language: {
            maximumSelected: (args) => 'Можно выбрать не более ' + args.maximum + ' позиций',
        }
    });
    // --- select2 ---
    // $('.js-select2-street').select2({
    //     width: "100%",
    //     placeholder: "Введите улицу...",
    //     language: {
    //         noResults: () => "Улица не найдена",
    //     }
    // });

    // --- selectize ---
    // $('.js-select2-street-2').selectize();


    // ---------- ---------- Скрытие списка улиц ---------- ----------
    // $(document).on('input', '.selectize-input input', function () {
    //     if ($(this).val() === '') {
    //         console.log('123')
    //         // $('.selectize-dropdown').css('display', 'none !important');
    //         $('.selectize-dropdown').attr("style", "display: none !important");
    //     } else {
    //         console.log('456')
    //         // $('.selectize-dropdown').css('display', 'block !important');
    //         $('.selectize-dropdown').attr("style", "display: block !important");
    //     }
    // })


    if (typeof ymaps !== "undefined") {
        ymaps.ready(init_map);

        function init_map() {
            let delivery_price = 0;
            let min_delivery_price = 0;

            if ($('#delivery_map').length) {

                $('#delivery_map').height(400).width('100%');

                let myMap = new ymaps.Map('delivery_map', {
                    center: [55.971851,
                        54.714068],
                    zoom: 10,
                    controls: ['geolocationControl', 'searchControl']
                });
                let deliveryPoint = new ymaps.GeoObject({
                    geometry: {type: 'Point'},
                    properties: {iconCaption: 'Адрес'}
                }, {
                    preset: 'islands#blackDotIconWithCaption',
                    draggable: true,
                    openEmptyBalloon: true,
                    iconCaptionMaxWidth: '215'
                });
                let searchControl = myMap.controls.get('searchControl');

                searchControl.options.set({noPlacemark: true, placeholderContent: 'Введите адрес доставки'});
                myMap.geoObjects.add(deliveryPoint);

                //Обновление полей формы после перемещения указателя на карте NOT USED
                function update_delivery_form(obj) {
                }

                //Как только зоны доставки загружены
                function onZonesLoad(json) {

                    //Обновление маркера на карте после изменения данных формы
                    function update_map_marker() {
                        let delivery_city = $('#delivery_city').val();
                        let delivery_street = $('#delivery_street').val();
                        let delivery_home = $('#delivery_home').val();
                        let delivery_housing = $('#delivery_housing').val();

                        //Если все поля заполнены
                        if (delivery_city !== '' &&
                            delivery_street !== '' &&
                            delivery_home !== '') {
                            //записываем введенный адрес в одну строку
                            let address_line = [
                                delivery_city,
                                delivery_street,
                                delivery_home,
                            ].join(', ');
                            if (delivery_housing !== '') address_line += ' к' + delivery_housing;

                            //записанный адрес передаем геокодеру для получения координат
                            var myGeocoder = ymaps.geocode(address_line);
                            myGeocoder.then(
                                function (res) {
                                    // Двигаем метку.
                                    deliveryPoint.geometry.setCoordinates(res.geoObjects.get(0).geometry.getCoordinates());
                                    highlightResult(deliveryPoint);
                                },
                                function (err) {
                                    // обработка ошибки
                                    console.error(err);
                                }
                            );
                        }
                    }

                    //обновление суммы вместе с доставкой
                    function update_delivery_sum() {
                        var total;
                        var without_nabor_sum = get_cart_sum(true, true);

                        let sum = 0;

                        total = sum + delivery_price;

                        ymaps_delivery_avaliable = without_nabor_sum >= min_delivery_price;
                        ymaps_delivery_price_modifier = total;

                        update_total_price_in_cart();
                    }

                    function updateSum() {
                        //получаем сумму
                        // var sum = get_cart_sum(true);
                        // $('.cart_total_sum').text(sum);
                        //обновление суммы вместе с доставкой
                        update_delivery_sum();
                    }

                    //вычисление суммы
                    function get_cart_sum(update_field = false, without_items = false) {
                        // var sum=0;
                        // $('.catalog_cart_table .cart_item').each(function(i, elem) {
                        //     var kol=parseInt($(this).find('input').val()),
                        //         price=parseInt($(this).find('span').text());
                        //     if (!without_items || !$(this).hasClass('nabor'))
                        //         sum+=price*kol;
                        //     if (update_field) {
                        //         $(this).find('.price_sp>span').text();
                        //         $(this).find('.sum_price').text(price*kol);
                        //     }
                        // });

                        return get_total_price_in_cart();
                    }

                    function highlightResult(obj) {

                        function setData(obj) {
                            var address = [obj.getThoroughfare(), obj.getPremiseNumber(), obj.getPremise()].join(' ');
                            if (address.trim() === '') {
                                address = obj.getAddressLine();
                            }

                            delivery_price = polygon.properties.get('delivery-price');
                            min_delivery_price = polygon.properties.get('min-price');

                            var cart_sum = get_cart_sum(), calculated_delivery_price;
                            var without_nabor_sum = get_cart_sum(true, true);

                            calculated_delivery_price = delivery_price;

                            ymaps_delivery_avaliable = without_nabor_sum >= min_delivery_price;
                            ymaps_delivery_price_modifier = calculated_delivery_price;

                            if (cart_sum >= min_delivery_price) {
                                deliveryPoint.properties.set({
                                    iconCaption: address,
                                    balloonContent: address,
                                    balloonContentHeader: '<b>Стоимость доставки: ' + calculated_delivery_price + ' <i class="fas fa-ruble-sign" style="font-size: 1em;"></i></b>'
                                });
                            } else {
                                ymaps_delivery_discard_delivery_reason = 'min_sum';
                                ymaps_delivery_min_price = min_delivery_price;

                                deliveryPoint.properties.set({
                                    iconCaption: address,
                                    balloonContent: address,
                                    balloonContentHeader: '<b>На данный адрес минимальная сумма заказа: ' + min_delivery_price + ' <i class="fas fa-ruble-sign" style="font-size: 1em;"></i></b>'
                                });
                            }

                        }

                        // Сохраняем координаты переданного объекта.
                        var coords = obj.geometry.getCoordinates(),
                            // Находим полигон, в который входят переданные координаты.
                            polygon = deliveryZones.searchContaining(coords).get(0);

                        if (polygon) {
                            // Уменьшаем прозрачность всех полигонов, кроме того, в который входят переданные координаты.
                            deliveryZones.setOptions('fillOpacity', 0.4);
                            polygon.options.set('fillOpacity', 0.8);
                            // Перемещаем метку с подписью в переданные координаты и перекрашиваем её в цвет полигона.
                            deliveryPoint.geometry.setCoordinates(coords);
                            deliveryPoint.options.set('iconColor', polygon.options.get('fillColor'));
                            // Задаем подпись для метки.
                            if (typeof (obj.getThoroughfare) === 'function') {
                                setData(obj);
                                updateSum();
                            } else {
                                // Если вы не хотите, чтобы при каждом перемещении метки отправлялся запрос к геокодеру,
                                // закомментируйте код ниже.
                                ymaps.geocode(coords, {results: 1}).then(function (res) {
                                    var obj = res.geoObjects.get(0);
                                    setData(obj);
                                    updateSum();
                                });
                            }
                        } else {
                            // Если переданные координаты не попадают в полигон, то задаём стандартную прозрачность полигонов.
                            deliveryZones.setOptions('fillOpacity', 0.4);
                            // Перемещаем метку по переданным координатам.
                            deliveryPoint.geometry.setCoordinates(coords);
                            // Задаём контент балуна и метки.
                            deliveryPoint.properties.set({
                                iconCaption: 'Возможность доставки уточните у оператора',
                                balloonContent: 'Возможность доставки уточните у оператора',
                                balloonContentHeader: ''
                            });
                            // Перекрашиваем метку в чёрный цвет.
                            deliveryPoint.options.set('iconColor', 'black');

                            //Сбрасываем стоимость доставки
                            delivery_price = 0;

                            min_delivery_price = Infinity;

                            ymaps_delivery_discard_delivery_reason = 'out_of_zone';

                            updateSum();
                        }

                        deliveryPoint.balloon.open();

                        update_total_price_in_cart();
                    }

                    //при изменении данных формы двигаем указатель на карте
                    if (window.location.pathname === '/') {
                        $('[data-check_address_btn]').click(function () {
                            let check_address_city = $('#delivery_city').val();
                            let check_address_street = $('#delivery_street').val();
                            let check_address_home = $('#delivery_home').val();

                            if (check_address_street === '') {
                                $('.check-address_result span').text('Введите улицу');
                                $('.check-address_result').show();
                            } else if (check_address_street !== '' && check_address_home === '') {
                                $('.check-address_result span').text('Введите номер дома');
                                $('.check-address_result').show();
                            } else {
                                $.ajax({
                                    url: api_url + 'address',
                                    async: true,
                                    data: {
                                        action: 'checkAddress',
                                        sid: js_cart['sid'],
                                        city: check_address_city,
                                        street: check_address_street,
                                        home: check_address_home,
                                    },
                                    method: "POST",
                                    beforeSend: function () {
                                        $('.check-address_result-loader').show();
                                        $('.check-address_result').hide();
                                    },
                                    success: function (data) {
                                        let json_data = JSON.parse(data);

                                        if (json_data['addressInZone'] === true) {
                                            sessionStorage.setItem('address_street', check_address_street);
                                            sessionStorage.setItem('address_home', check_address_home);

                                            $('.check-address_result-loader').hide();
                                            $('.check-address_result span').text('Доставка возможна');
                                            $('.check-address_result').show();

                                            $('#delivery_street, #delivery_home').trigger('change');
                                            update_map_marker();

                                        } else if (json_data['addressInZone'] === false) {
                                            sessionStorage.removeItem('address_street');
                                            sessionStorage.removeItem('address_home');

                                            $('.check-address_result-loader').hide();
                                            $('.check-address_result span').text('Доставка по данному адресу не осуществляется');
                                            $('.check-address_result').show();

                                        } else {
                                            sessionStorage.removeItem('address_street');
                                            sessionStorage.removeItem('address_home');

                                            $('.check-address_result-loader').hide();
                                            $('.check-address_result span').text('Произошла ошибка. Попробуйте позднее');
                                            $('.check-address_result').show();
                                        }

                                    },

                                })
                            }
                        })

                    } else {
                        $('#delivery_street, #delivery_home, #delivery_select_address').change(update_map_marker);

                        if($('#delivery_street') !== '') {
                            $('#delivery_home').blur(function () {
                                $.ajax({
                                    url: api_url + 'address',
                                    async: true,
                                    data: {
                                        action: 'checkAddress',
                                        sid: js_cart['sid'],
                                        city: $('#delivery_city').val(),
                                        street: $('#delivery_street').val(),
                                        home: $('#delivery_home').val(),
                                    },
                                    method: "POST",

                                    success: function (data) {
                                        let json_data = JSON.parse(data);
                                        if (json_data['addressInZone'] === false) {
                                            alert('К сожалению, по адресу "' + $('#delivery_street').val() + ', ' + 'д. ' + $('#delivery_home').val() + '" доставка не осуществляется')
                                        } else {

                                        }
                                    }
                                })
                            })
                        }
                    }


                    // Добавляем зоны на карту.
                    var deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
                    // Задаём цвет и контент балунов полигонов.
                    deliveryZones.each(function (obj) {
                        var color = obj.options.get('fillColor');
                        color = color.substring(0, color.length - 2);
                        obj.options.set({fillColor: color, fillOpacity: 0.4});
                        obj.properties.set('balloonContent', obj.properties.get('description'));
//                    obj.properties.set('balloonContentHeader', 'Стоимость доставки: ' + obj.properties.get('price') + ' р.')
                    });

                    // Проверим попадание результата поиска в одну из зон доставки.
                    searchControl.events.add('resultshow', function (e) {
                        highlightResult(searchControl.getResultsArray()[e.get('index')]);
                    });

                    // Проверим попадание метки геолокации в одну из зон доставки.
                    myMap.controls.get('geolocationControl').events.add('locationchange', function (e) {
                        highlightResult(e.get('geoObjects').get(0));
                    });

                    // При перемещении метки сбрасываем подпись, содержимое балуна и перекрашиваем метку.
                    deliveryPoint.events.add('dragstart', function () {
                        deliveryPoint.properties.set({iconCaption: '', balloonContent: ''});
                        deliveryPoint.options.set('iconColor', 'black');
                    });

                    // По окончании перемещения метки вызываем функцию выделения зоны доставки.
                    deliveryPoint.events.add('dragend', function () {
                        highlightResult(deliveryPoint);
                        update_delivery_form(deliveryPoint);
                    });
                }

                $.ajax({
//                url: 'https://sandbox.api.maps.yandex.net/examples/ru/2.1/delivery_zones/data.json',
                    url: '/engine/components/catalog/cart/data.json',
                    dataType: 'json',
                    success: onZonesLoad
                });

            }


            //проверка адреса

            let address_checker_map = new ymaps.Map('address_checker_map', {
                center: [60.61854802445384, 56.82311716562906],
                zoom: 10,
                controls: ['geolocationControl', 'searchControl']
            });

            //Как только зоны доставки загружены
            function on_address_checker_map_zones_load(json) {

                //Обновление маркера на карте после изменения данных формы
                function update_map_marker() {
                    let delivery_city = $('#check_delivery_city').val();
                    let delivery_street = $('#check_delivery_street').val();
                    let delivery_home = $('#check_delivery_home').val();
                    let delivery_housing = $('#check_delivery_housing').val();

                    //Если все поля заполнены
                    if (delivery_city !== '' && delivery_street !== '' && delivery_home !== '') {

                        $(address_checker_result).html('Пожалуйста пожождите...');

                        //записываем введенный адрес в одну строку
                        let address_line = [
                            delivery_city,
                            delivery_street,
                            delivery_home,
                        ].join(', ');
                        if (delivery_housing !== '') address_line += ' к' + delivery_housing;

                        //записанный адрес передаем геокодеру для получения координат
                        var myGeocoder = ymaps.geocode(address_line);
                        myGeocoder.then(
                            function (res) {
                                highlightResult(res);
                            },
                            function (err) {
                                console.error(err);
                            }
                        );
                    } else {
                        $(address_checker_result).html('Пожалуйста введите название улицы и номер дома');
                    }
                }

                function highlightResult(obj) {
                    console.log(obj);

                    function setData(check = false) {
                        if (check) {
                            $(address_checker_result).html('На данный адрес возможна доставка');
                        } else {
                            $(address_checker_result).html('На данный адрес доставка не осуществляется');
                        }
                    }

                    // Сохраняем координаты переданного объекта.
                    let coords = obj.geoObjects.get(0).geometry.getCoordinates()

                    // Находим полигон, в который входят переданные координаты.
                    let polygon = deliveryZones.searchContaining(coords).get(0);

                    if (polygon) {
                        //
                        setData(true);
                    } else {
                        // Если переданные координаты не попадают в полигон
                        setData(false);
                    }

                    update_total_price_in_cart();
                }

                //при изменении данных формы двигаем указатель на карте
                $('#address_checker_btn').click(update_map_marker);

                // Добавляем зоны на карту.
                var deliveryZones = ymaps.geoQuery(json).addToMap(address_checker_map);
            }

            $.ajax({
                url: '/engine/components/catalog/cart/data.json',
                dataType: 'json',
                success: on_address_checker_map_zones_load
            });
        }
    }
    $('#confirm_phone, input[type="tel"]').mask('+7 (999) 999-99-99');


    // ---------- ----------  ---------- Авторизация 2.0 - начало ---------- ---------- ----------
    // Если пользователь не авторизован
    if (parseInt(js_cart.user) === 0) {
        $('.widget_auth span').html('Войти');

        $('.widget_auth').on('click', function () {
            $('.sign_up-wrapper').addClass('sign_up-active');
            $('.sign_up').addClass('sign_up-active');
        });

        $('.sign_up-wrapper, .sign_up-close, .sign_up-success').on('click', function () {
            $('.sign_up-wrapper').removeClass('sign_up-active');
            $('.sign_up').removeClass('sign_up-active');
        });

    } else { // Если пользователь авторизован
        $('.widget_auth').attr('href', '/profile');

        // Получаем имя пользователя и присваиваем виджету в хэдере
        let request_data = {
            "action": "get",
            "id": js_cart.user,
        };
        $.ajax({
            'type': 'POST',
            'url': api_url + 'user',
            'data': request_data,
            'success': function (data) {
                $('.widget_auth span').html(data.name);
            },
        });
    }

    // Нажатие на Enter на 1 этапе
    $("#signup_phone").keyup(function (event) {
        if (event.keyCode === 13) {
            $('[data-signup_go_stage="2"]').click();
        }
    });
    // Нажатие на Enter на 2 этапе
    $("#signup_auth_code").keyup(function (event) {
        if (event.keyCode === 13) {
            $('[data-signup_go_stage="3"]').click();
        }
    });
    // Нажатие на Enter на 2 этапе
    $("#signup_name").keyup(function (event) {
        if (event.keyCode === 13) {
            $('[data-signup_go_stage="4"]').click();
        }
    });

    // ---------- Переход с 1 этапа на 2 этап с вводом кода из СМС ----------
    function signup_go_stage2(event) {
        event.preventDefault();

        let request_data = {
            "method": "phone_onetime.auth",
            "sid": js_cart.sid,
            "user": js_cart.user,
            "stage": 1,
            "phone": $('#signup_phone').val(),
        };
        $('#signup_phone-repeat').val($('#signup_phone').val());

        // $.ajax({
        //     'type': 'POST',
        //     'url': api_url + 'auth',
        //     'data': request_data,
        //     'success': function (data) {
        //         if (data.status === 'ok') {
        //             $('[data-signup_stage="1"]').hide();
        //             $('[data-signup_stage="2"]').show();
        //         } else if (data.status === 'need_reg') {
        //             let request_data = {
        //                 "method": "phone_onetime.reg",
        //                 "sid": js_cart.sid,
        //                 "user": js_cart.user,
        //                 "stage": 1,
        //                 "phone": $('#signup_phone').val(),
        //                 //"user_name": $('#confirm_first_name').val(),
        //             };
        //
        //             $.ajax({
        //                 'type': 'POST',
        //                 'url': api_url + 'auth',
        //                 'data': request_data,
        //                 'success': function (data) {
        //                     if (data.status === 'ok') {
        //                         $('[data-signup_stage="1"]').hide();
        //                         $('[data-signup_stage="4"]').show();
        //                     } else {
        //                         alert('Произошла ошибка. Попробуйте авторизоваться позднее.');
        //                     }
        //                 },
        //             });
        //         } else {
        //             alert('Произошла ошибка. Попробуйте авторизоваться позднее.');
        //         }
        //     },
        // });
        $('[data-signup_stage="1"]').hide();
        $('[data-signup_stage="2"]').show();
        //Получить имя пользователся (если есть телефон в бд) и присвоить его импуту с именем на 3 этапе
        let request_data2 = {
            "action": "get",
            "phone": $('#signup_phone').val(),
        };

        $.ajax({
            'type': 'POST',
            'url': api_url + 'user',
            'data': request_data2,
            'success': function (data) {
                $('#signup_name').val(data.name);
            },
        });
    }

    // ----------  Изменить номер телефона (возврат со второго этапа на первый этап) ----------
    function signup_go_stage1(event) {
        event.preventDefault();
        $('[data-signup_stage="2"]').hide();
        $('[data-signup_stage="1"]').show();
    }

    // ----------  Повторить отправку СМС с кодом ----------
    function signup_repeat_code(event) {
        event.preventDefault();

        let request_data = {
            "method": "phone_onetime.auth",
            "sid": js_cart.sid,
            "user": js_cart.user,
            "stage": 1,
            "phone": $('#signup_phone').val(),
        };

        $.ajax({
            'type': 'POST',
            'url': api_url + 'auth',
            'data': request_data,
            'success': function (data) {
                if (data.status === 'ok') {
                    //ничего
                } else if (data.status === 'need_reg') {
                    let request_data = {
                        "method": "phone_onetime.reg",
                        "sid": js_cart.sid,
                        "user": js_cart.user,
                        "stage": 1,
                        "phone": $('#signup_phone').val(),
                    };

                    $.ajax({
                        'type': 'POST',
                        'url': api_url + 'auth',
                        'data': request_data,
                        'success': function (data) {
                            if (data.status === 'ok') {
                                //ничего
                            } else {
                                alert('Произошла ошибка. Попробуйте обновить страницу и повторить авторизацию.');
                            }
                        },
                    });
                } else {
                    alert('Произошла ошибка. Попробуйте обновить страницу и повторить авторизацию.');
                }
            },
        });
    }

    // ----------  Переход на трейти этап (код из СМС введен верно) ----------
    function signup_go_stage3(event) {
        event.preventDefault();

        let request_data = {
            "method": "phone_onetime.confirm_auth",
            "sid": js_cart.sid,
            "user": js_cart.user,
            "stage": 2,
            "phone": $('#signup_phone').val(),
            "onetime_token": $('#signup_auth_code').val(),
        };

        $.ajax({
            'type': 'POST',
            'url': api_url + 'auth',
            'data': request_data,
            'success': function (data) {
                if (data.status === 'ok') {
                    js_cart.user = data.user_id;
                    $('[data-signup_stage="2"]').hide();
                    $('[data-signup_stage="3"]').show();

                    if (String(window.location.pathname) === '/cart') {
                        $('.sign_up-wrapper, .sign_up-close').on('click', function () {
                            location.reload();
                        });
                    }
                } else if (data.status === 'invalid_code') {
                    alert('Неверный код.');
                } else {
                    alert('Произошла ошибка. Попробуйте авторизоваться позднее.');
                }
            },
        });
    }

    // ----------  Переход на последний этап - успех! ----------
    function signup_go_stage4(event) {
        event.preventDefault();

        let request_data = {
            "action": "edit",
            "id": js_cart.user,
            "name": $('#signup_name').val(),
        };

        $.ajax({
            'type': 'POST',
            'url': api_url + 'user',
            'data': request_data,
            'success': function (data) {
            },
        });

        $('.widget_auth').attr('href', '/profile');
        $('.widget_auth span').html($('#signup_name').val());

        $('[data-signup_stage="3"]').hide();
        $('[data-signup_stage="4"]').show();

        if (String(window.location.pathname) === '/auth') {
            $('.sign_up-wrapper, .sign_up-close, .sign_up-success').on('click', function () {
                document.location = '/profile'
            });
        }
        if (String(window.location.pathname) === '/cart') {
            $('.sign_up-wrapper, .sign_up-close, .sign_up-success').on('click', function () {
                location.reload();
            });
        }
        $('.widget_auth').on('click', function () {
            $('.sign_up-wrapper').removeClass('sign_up-active');
            $('.sign_up').removeClass('sign_up-active');
        });
    }

    // ---------- ---------- ---------- Авторизация 2.0 - конец ----------  ---------- ----------

    // ---------- ---------- ---------- Очистка корзины ---------- ---------- ----------
    function clear_cart(event) {
        event.preventDefault();

        $.ajax({
            url: api_url + 'cart',
            async: true,
            data: {
                method: 'cart',
                action: 'clear',
                sid: js_cart['sid']
            },
            method: "POST",
            beforeSend: function () {

            },
            success: function (data) {
                ajax_cart.cart = data.cart;
                localStorage.removeItem('promocode');
                localStorage.removeItem('promocode_type');
                location.reload();
            }
        });
    }

    // ---------- ---------- ---------- Удаление продукта из корзины ---------- ---------- ----------
    function clear_product(event) {
        event.preventDefault();

        let product_container = $(this).closest(selector_cart_container);
        let product_id = product_container.data('product_id');
        let applied_modifiers = get_applied_modifiers(product_container);

        let cart_container = product_container.closest(selector_cart_container);

        $.ajax({
            url: api_url + 'cart',
            async: true,
            data: {
                method: 'cart',
                product_id: product_id,
                applied_modifiers: applied_modifiers,
                action: 'delete',
                user: js_cart['user'],
                sid: js_cart['sid']
            },
            method: "POST",
            beforeSend: function () {

            },
            success: function (data) {
                ajax_cart.cart = data.cart;
                update_product_count(product_id, applied_modifiers, data.amount);
                update_product_price(product_id, applied_modifiers, data.amount);

                product_container.remove();

                get_total_count().then((count) => {
                    if (count === 0) {
                        $(selector_not_empty_cart).hide();
                        $(selector_empty_cart).show();
                    }
                })

                // todo-aidar работа с промо при удалении товара
                if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                    check_promocode(localStorage.getItem('promocode'));
                    console.log('удаление продукта')
                }
            }
        });
    }

    // ---------- ---------- ---------- Попап корзины (виджет корзины) - начало ---------- ---------- ----------
    function open_widget_cart(e) {
        e.preventDefault();

        if ($('.cart_popup').hasClass('cart_popup--active')) {
            $('.cart_popup').removeClass('cart_popup--active');
            $('.widget_cart').removeClass('widget_cart--active');
        } else {
            $('.cart_popup__items').empty();

            $.ajax({
                url: api_url + 'cart',
                async: true,
                data: {
                    action: 'get',
                    sid: js_cart['sid']
                },
                method: "POST",
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.status === 'ok') {
                        (data.cart).forEach(function (item) {

                            let div = document.createElement('div');
                            div.dataset.product_id = item.id;
                            div.dataset.product_container = '';
                            div.dataset.product_price = item.values[0].product_price;

                            let div2 = document.createElement('div');
                            let div3 = document.createElement('div');
                            let div4 = document.createElement('div');
                            div4.dataset.product_control_inc = "";
                            div4.innerHTML = '<div class="product-incr">\n' +
                                '               <div class="elements-icr-block amountData">\n' +
                                '                   <div class="incr">\n' +
                                '                       <div class="incr__minus incr__nav" data-popup_product_del>\n' +
                                '                           <svg class="icon">\n' +
                                '                               <use xlink:href="#minus">\n' +
                                '                                   <svg viewBox="0 0 42 42" id="minus"\n' +
                                '                                   xmlns="http://www.w3.org/2000/svg">\n' +
                                '                                   <path d="M0 19h42v4H0z"></path>\n' +
                                '                                  </svg>\n' +
                                '                                 </use>\n' +
                                '                                </svg>\n' +
                                '                               </div>\n' +
                                '                              <div class="incr__val">\n' +
                                '                               <span data-product_counter>' + item.values[0].amount + '</span>\n' +
                                '                               <div class="incr__val-coner"></div>\n' +
                                '                              </div>\n' +
                                '                             <div class="incr__plus incr__nav" data-product_inc>\n' +
                                '                               <svg class="icon">\n' +
                                '                                   <use xlink:href="#plus">\n' +
                                '                                       <svg viewBox="0 0 42 42" id="plus"\n' +
                                '                                       xmlns="http://www.w3.org/2000/svg">\n' +
                                '                                       <path d="M42 19H23V0h-4v19H0v4h19v19h4V23h19z"></path>\n' +
                                '                                       </svg>\n' +
                                '                                      </use>\n' +
                                '                               </svg>\n' +
                                '                             </div>\n' +
                                '                           </div>\n' +
                                '                        </div>\n' +
                                '                     </div>';

                            let p = document.createElement('p');
                            let p1 = document.createElement('p');
                            let h3 = document.createElement('h3');

                            div.className = "cart_popup__item";
                            div2.className = "cart_popup__item_desc";
                            div3.className = "cart_popup__item_sm_desc";
                            div4.className = "prod_control";

                            p.className = "cart_popup__item_price";
                            p1.className = "cart_popup__item_weight";


                            h3.innerHTML = item.name;
                            p.innerHTML = item.values[0].product_price + ' &#8381;';
                            p1.innerHTML = item.name;

                            div3.append(p);
                            // div3.append(p1);
                            div2.append(h3);
                            div2.append(div3);
                            div.append(div2);
                            div.append(div4);

                            $('.cart_popup__items').append(div);
                        })

                        $('.cart_popup--not_empty').css('display', 'block');
                        $('.cart_popup--empty').css('display', 'none');
                        $('.cart_popup').addClass('cart_popup--active');
                        $('.widget_cart').addClass('widget_cart--active');

                        $('[data-popup_product_del]').on('click', function () {
                            let product_container = $(this).closest(selector_product_container);
                            let product_id = product_container.data('product_id');
                            let applied_modifiers = get_applied_modifiers(product_container);

                            $.ajax({
                                url: api_url + 'cart',
                                async: true,
                                data: {
                                    method: 'cart',
                                    product_id: product_id,
                                    action: 'minus',

                                    sid: js_cart['sid']
                                },
                                method: "POST",
                                success: function (data) {
                                    ajax_cart.cart = data.cart;
                                    update_product_count(product_id, applied_modifiers, data.amount);
                                    update_product_price(product_id, applied_modifiers, data.amount);
                                    if (parseInt(data.amount) === 0) {
                                        product_container.remove();

                                        $('.cart_list').find('[data-product_id=' + product_id + ']').remove();

                                        $('.product_list').find('[data-product_id=' + product_id + ']').find('[data-product_control_add]').css('display', 'block')
                                        $('.product_list').find('[data-product_id=' + product_id + ']').find('[data-product_control_inc]').css('display', 'none');

                                        get_total_count().then((count) => {
                                            if (count === 0) {
                                                $('.cart_popup--not_empty').css('display', 'none');
                                                $('.cart_popup--empty').css('display', 'block');

                                                if (String(window.location.pathname) === '/cart') {
                                                    location.reload();
                                                }
                                            }
                                        })
                                    }

                                    // todo-aidar работа с промо при удалении товара
                                    if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') {
                                        check_promocode(localStorage.getItem('promocode'));
                                        console.log('Уменьшение товара виджет')
                                    }

                                }
                            });
                        })
                    } else {
                        $('.cart_popup--not_empty').css('display', 'none');
                        $('.cart_popup--empty').css('display', 'block');
                        $('.cart_popup').addClass('cart_popup--active');
                        $('.widget_cart').addClass("widget_cart--active");
                    }
                }
            });
        }
        $('.cart_popup--clear_cart').on('click', function (e) {

            $('.cart_popup--not_empty').find($('[data-product_container]')).each(function () {
                let id_product = $(this).attr('data-product_id');
                $('.product_list').find('[data-product_id=' + id_product + ']').find('[data-product_control_add]').css('display', 'block')
                $('.product_list').find('[data-product_id=' + id_product + ']').find('[data-product_control_inc]').css('display', 'none');
            })

            $.ajax({
                url: api_url + 'cart',
                async: true,
                data: {
                    method: 'cart',
                    action: 'clear',
                    sid: js_cart['sid']
                },
                method: "POST",
                success: function (data) {
                    ajax_cart.cart = data.cart;
                    $('.cart_popup--not_empty').css('display', 'none');
                    $('.cart_popup--empty').css('display', 'block');

                    if (String(window.location.pathname) === '/cart') {
                        location.reload();
                    }
                }
            });
        })

        $('.cart_popup--closer').on('click', function (e) {
            e.preventDefault();
            $('.cart_popup').removeClass('cart_popup--active')
        });
        $(document).mouseup(function (e) {
            var widget_cart_popup = $('.cart_popup');
            var widget_cart = $('.widget_cart')
            if (!widget_cart_popup.is(e.target) && widget_cart_popup.has(e.target).length === 0
                && !widget_cart.is(e.target) && widget_cart.has(e.target).length === 0) {
                widget_cart_popup.removeClass('cart_popup--active');
                widget_cart.removeClass('widget_cart--active');
            }
        });

    }

    // ---------- ---------- ---------- Попап корзины (виджет корзины) - конец ---------- ---------- ----------

    // ---------- ---------- ---------- Страница корзины - начало ---------- ---------- ----------
    if (String(window.location.pathname) === '/cart') {

        if (sessionStorage.getItem('address_street') && sessionStorage.getItem('address_street') !== '') {
            $('#delivery_street').val(sessionStorage.getItem('address_street')).trigger('change');
            $('#delivery_home').val(sessionStorage.getItem('address_home')).trigger('change');
        }

        // ---------- ---------- Рекомендуемое - начало ---------- ----------
        $.ajax({
            url: "/api/recommended?ssid=" + js_cart['sid'],
            // url: "/api/recommended?id=" + js_cart['user'],
            async: true,
            method: "POST",
            beforeSend: function() {
                $('.cart-sales__loader').show();
                $('.sales_list').hide()
            },
            success: function (data) {
                if (data.status === 'ok') {

                    $('.sales_list').empty();

                    let recommend_categories = JSON.parse(data.list);

                    delete recommend_categories['Горячие роллы'];

                    let recommend_name = Object.keys(recommend_categories); // Названия категорий, которых нет - ключи объекта

                    // все категории
                    // let recommend_check = ['Напитки', 'Закуски', 'Салаты', 'Наборы',
                    //     'Простые', 'Горячие', 'Холодные'];
                    //Напитки - \u041d\u0430\u043f\u0438\u0442\u043a\u0438
                    //Закуски - \u0417\u0430\u043a\u0443\u0441\u043a\u0438
                    //Салаты - \u0421\u0430\u043b\u0430\u0442\u044b
                    //Наборы - \u041d\u0430\u0431\u043e\u0440\u044b
                    //Простые - \u041f\u0440\u043e\u0441\u0442\u044b\u0435
                    //Горячие - \u0413\u043e\u0440\u044f\u0447\u0438\u0435
                    //Холодные - \u0425\u043e\u043b\u043e\u0434\u043d\u044b\u0435

                    // удаляем категории, которые есть в заказе
                    // recommend_check = recommend_check.filter(e => !~recommend_name.indexOf(e));

                    for (let i = 0; i < recommend_name.length; i++) {
                        let product = recommend_categories[recommend_name[i]];
                        let product_id_max = product.length;
                        let product_id_random = Math.floor(Math.random() * (Math.floor(product_id_max) - Math.ceil(0) + 1));

                        let div1 = document.createElement('div');
                        let div2 = document.createElement('div');
                        let div3 = document.createElement('div');
                        let div4 = document.createElement('div');
                        let div5 = document.createElement('div');
                        let div6 = document.createElement('div');

                        let img = document.createElement('img');
                        let h3 = document.createElement('h3');
                        let span1 = document.createElement('span');
                        let span2 = document.createElement('span');
                        let span3 = document.createElement('span');


                        div1.className = "sales_prod";
                        div2.className = "sales_prod_img";
                        div3.className = "sales_nav";
                        div4.className = "prod_desc";
                        div5.className = "";
                        div6.className = "prod_control";

                        span1.className = "price";
                        span2.className = "weight";
                        span3.className = "prod_btn btn";


                        div1.dataset.product_id = product[0].id;
                        div1.dataset.product_container = '';
                        div1.dataset.product_price = product[0].price;
                        div5.dataset.product_control_add = "";
                        div6.dataset.product_control_inc = "";
                        span3.dataset.product_add_in_cart = "";

                        img.src = "/media/catalog/" + product[0].photo;
                        div6.style.display = "none";

                        h3.innerHTML = product[0].name;
                        span1.innerHTML = product[0].price + ' &#8381;';
                        span2.innerHTML = Math.round((product[0].weight * 1000) * 100) / 100 + ' г';
                        span3.innerHTML = 'В корзину'

                        div6.innerHTML = '<div class="product-incr">\n' +
                            '                                            <div class="elements-icr-block amountData">\n' +
                            '                                                <div class="incr">\n' +
                            '                                                    <div class="incr__minus incr__nav" data-product_del="">\n' +
                            '                                                        <svg class="icon">\n' +
                            '                                                            <use xlink:href="#minus">\n' +
                            '                                                                <svg viewBox="0 0 42 42" id="minus" xmlns="http://www.w3.org/2000/svg">\n' +
                            '                                                                    <path d="M0 19h42v4H0z"></path>\n' +
                            '                                                                </svg>\n' +
                            '                                                            </use>\n' +
                            '                                                        </svg>\n' +
                            '                                                    </div>\n' +
                            '                                                    <div class="incr__val">\n' +
                            '                                                        <span data-product_counter="">0</span>\n' +
                            '                                                        <div class="incr__val-coner"></div>\n' +
                            '                                                    </div>\n' +
                            '                                                    <div class="incr__plus incr__nav" data-product_inc="">\n' +
                            '                                                        <svg class="icon">\n' +
                            '                                                            <use xlink:href="#plus">\n' +
                            '                                                                <svg viewBox="0 0 42 42" id="plus" xmlns="http://www.w3.org/2000/svg">\n' +
                            '                                                                    <path d="M42 19H23V0h-4v19H0v4h19v19h4V23h19z"></path>\n' +
                            '                                                                </svg>\n' +
                            '                                                            </use>\n' +
                            '                                                        </svg>\n' +
                            '                                                    </div>\n' +
                            '                                                </div>\n' +
                            '                                            </div>\n' +
                            '                                        </div>';


                        div2.append(img);
                        div4.append(span1, span2);
                        div5.append(span3);
                        div3.append(h3, div4, div5, div6);
                        div1.append(div2, div3);

                        $('.sales_list').append(div1);
                    }


                    setTimeout(function () {
                        $('.cart-sales__loader').hide();
                        $('.sales_list').show();

                        // Слайдер рекомендуемого
                        $('.sales_list-m').slick({
                            dots: false,
                            arrows: true,
                            infinite: true,
                            slidesToShow: 1,
                            slidesToScroll: 1
                        });
                        $('.sales_list-d').slick({
                            dots: true,
                            arrows: true,
                            infinite: true,
                            slidesToShow: 3,
                            slidesToScroll: 1,
                            responsive: [
                                {
                                    breakpoint: 1300,
                                    settings: {
                                        slidesToShow: 2,
                                        slidesToScroll: 1,
                                    }
                                },
                            ]
                        });
                    }, 5000)
                }
                //удалить?
                else {
                }
            }
        });
        // ---------- ---------- Рекомендуемое - конец ---------- ----------

        // ---------- ---------- ---------- Селект времени заказа - начало ---------- ---------- ----------
        let current_date = new Date();
        let new_date = new Date();
        let select_order_time = document.getElementById('order_time');
        let delivery_time_modal = document.querySelector('[data-delivery_time_modal]');

        // ---------- Если с ВС по ЧТ до 22:00 ----------
        if (current_date.getDay() === 0 || current_date.getDay() === 1 || current_date.getDay() === 2 || current_date.getDay() === 3 || current_date.getDay() === 4) {
            let current_hours = current_date.getHours();
            let current_minutes = current_date.getMinutes();

            //Если заказ за 1,5 часа до открытия
            if (current_hours * 60 + current_minutes < 510) {
                if (delivery_time_modal) {
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="Ближайшее время">Ближайшее время</div>');
                } else {
                    $('.cart_delivery_time select').append('<option value="Ближайшее время">Ближайшее время</option>');
                }


                for (let i = 0; i <= (22 - 10) * 2; i++) {
                    let new_date_full = new Date(new_date.setHours(10, 0, 0));
                    let time = new Date(new_date_full.setMinutes(new_date_full.getMinutes() + i * 30));
                    let new_hours = time.getHours();
                    let new_minutes = time.getMinutes();
                    if (new_minutes < 10) new_minutes = '0' + new_minutes;

                    if (delivery_time_modal) {
                        $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</div>');
                    } else {
                        $('.cart_delivery_time select').append('<option value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</option>');
                    }
                }
            }

            //Если заказ менее чем 1,5 часа до открытия или уже после открытия, но не позже 20:30
            else if (current_hours * 60 + current_minutes >= 510 && current_hours * 60 + current_minutes <= 1230) {

                if (delivery_time_modal) {
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="Ближайшее время">Ближайшее время</div>');
                } else {
                    $('.cart_delivery_time select').append('<option value="Ближайшее время">Ближайшее время</option>');
                }

                // Время чч:меньше/равно 30 минут
                if (current_minutes <= 30) {
                    for (let i = 0; i <= (22 - 2 - current_hours) * 2; i++) {
                        let new_date_full = new Date(new_date.setHours(current_hours + 2, 0, 0));
                        let time = new Date(new_date_full.setMinutes(new_date_full.getMinutes() + i * 30));
                        let new_hours = time.getHours();
                        let new_minutes = time.getMinutes();
                        if (new_minutes < 10) new_minutes = '0' + new_minutes;

                        if (delivery_time_modal) {
                            $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</div>');

                        } else {
                            $('.cart_delivery_time select').append('<option value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</option>');

                        }
                    }
                }

                // Время чч:больше 30 минут
                else {
                    for (let i = 0; i <= (22 - 2 - current_hours) * 2 - 1; i++) {
                        let new_date_full = new Date(new_date.setHours(current_hours + 2, 30, 0));
                        let time = new Date(new_date_full.setMinutes(new_date_full.getMinutes() + i * 30));
                        let new_hours = time.getHours();
                        let new_minutes = time.getMinutes();
                        if (new_minutes < 10) new_minutes = '0' + new_minutes;

                        if (delivery_time_modal) {
                            $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</div>');

                        } else {
                            $('.cart_delivery_time select').append('<option value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</option>');

                        }

                    }
                }
            }

            //Если заказ с 20:30 до 22:00
            else if (current_hours * 60 + current_minutes > 1230 && current_hours * 60 + current_minutes <= 1320) {

                if (delivery_time_modal) {
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="Ближайшее время">Ближайшее время</div>');
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="22:00:00">22:00</div>');
                } else {
                    $('.cart_delivery_time select').append('<option value="Ближайшее время">Ближайшее время</option>');
                    $('.cart_delivery_time select').append('<option value="22:00:00">22:00</option>');
                }


            }

            //Если заказ с 22:01 до 00:00
            else {

                if (delivery_time_modal) {
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="Завтра в ближайшее время">Завтра в ближайшее время</div>');

                } else {
                    $('.cart_delivery_time select').append('<option value="Завтра в ближайшее время">Завтра в ближайшее время</option>');

                }

                for (let i = 0; i <= (22 - 10) * 2; i++) {
                    let new_date_full = new Date(new_date.setHours(10, 0, 0));
                    let time = new Date(new_date_full.setMinutes(new_date_full.getMinutes() + i * 30));
                    let new_hours = time.getHours();
                    let new_minutes = time.getMinutes();
                    if (new_minutes < 10) new_minutes = '0' + new_minutes;

                    if (delivery_time_modal) {
                        $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="' + new_hours + ':' + new_minutes + ':00' + '">Завтра в ' + new_hours + ':' + new_minutes + '</div>');

                    } else {
                        $('.cart_delivery_time select').append('<option value="' + new_hours + ':' + new_minutes + ':00' + '">Завтра в ' + new_hours + ':' + new_minutes + '</option>');

                    }

                }
            }
        }

        // ---------- Если с ПТ по СБ до 22:30 ----------
        if (current_date.getDay() === 5 || current_date.getDay() === 6) {
            let current_hours = current_date.getHours();
            let current_minutes = current_date.getMinutes();

            //Если заказ за 1,5 часа до открытия
            if (current_hours * 60 + current_minutes < 510) {
                // let option_default = document.createElement('option');
                // option_default.setAttribute('value','Ближайшее время');
                // option_default.innerHTML= 'Ближайшее время';
                // select_order_time.appendChild(option_default);

                if (delivery_time_modal) {
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="Ближайшее время">Ближайшее время</div>');

                } else {
                    $('.cart_delivery_time select').append('<option value="Ближайшее время">Ближайшее время</option>');

                }


                for (let i = 0; i <= (22.5 - 10) * 2; i++) {
                    let new_date_full = new Date(new_date.setHours(10, 0, 0));
                    let time = new Date(new_date_full.setMinutes(new_date_full.getMinutes() + i * 30));
                    let new_hours = time.getHours();
                    let new_minutes = time.getMinutes();
                    if (new_minutes < 10) new_minutes = '0' + new_minutes;

                    if (delivery_time_modal) {
                        $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</div>');

                    } else {
                        $('.cart_delivery_time select').append('<option value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</option>');

                    }

                }
            }

            //Если заказ менее чем 1,5 часа до открытия или уже после открытия, но не позже 21:00
            else if (current_hours * 60 + current_minutes >= 510 && current_hours * 60 + current_minutes <= 1260) {

                if (delivery_time_modal) {
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="Ближайшее время">Ближайшее время</div>');

                } else {
                    $('.cart_delivery_time select').append('<option value="Ближайшее время">Ближайшее время</option>');

                }


                // Время чч:меньше/равно 30 минут
                if (current_minutes <= 30) {
                    for (let i = 0; i <= (22.5 - 2 - current_hours) * 2; i++) {
                        let new_date_full = new Date(new_date.setHours(current_hours + 2, 0, 0));
                        let time = new Date(new_date_full.setMinutes(new_date_full.getMinutes() + i * 30));
                        let new_hours = time.getHours();
                        let new_minutes = time.getMinutes();
                        if (new_minutes < 10) new_minutes = '0' + new_minutes;

                        // let option_time = document.createElement('option');
                        // option_time.setAttribute('value',new_hours + ':' + new_minutes);
                        // option_time.innerHTML= new_hours + ':' + new_minutes;
                        // select_order_time.appendChild(option_time);

                        if (delivery_time_modal) {
                            $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</div>');

                        } else {
                            $('.cart_delivery_time select').append('<option value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</option>');

                        }

                    }
                }

                // Время чч:больше 30 минут
                else {
                    for (let i = 0; i <= (22.5 - 2 - current_hours) * 2 - 1; i++) {
                        let new_date_full = new Date(new_date.setHours(current_hours + 2, 30, 0));
                        let time = new Date(new_date_full.setMinutes(new_date_full.getMinutes() + i * 30));
                        let new_hours = time.getHours();
                        let new_minutes = time.getMinutes();
                        if (new_minutes < 10) new_minutes = '0' + new_minutes;

                        if (delivery_time_modal) {
                            $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</div>');

                        } else {
                            $('.cart_delivery_time select').append('<option value="' + new_hours + ':' + new_minutes + ':00' + '">' + new_hours + ':' + new_minutes + '</option>');

                        }

                    }
                }
            }

            //Если заказ с 20:30 до 22:00
            else if (current_hours * 60 + current_minutes > 1260 && current_hours * 60 + current_minutes <= 1350) {

                if (delivery_time_modal) {
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="Ближайшее время">Ближайшее время</div>');
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="22:00:00">22:00</div>');

                } else {
                    $('.cart_delivery_time select').append('<option value="Ближайшее время">Ближайшее время</option>');
                    $('.cart_delivery_time select').append('<option value="22:00:00">22:00</option>');
                }

            }

            //Если заказ с 22:01 до 00:00
            else {
                if (delivery_time_modal) {
                    $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="Завтра в ближайшее время">Завтра в ближайшее время</div>');

                } else {
                    $('.cart_delivery_time select').append('<option value="Завтра в ближайшее время">Завтра в ближайшее время</option>');

                }

                for (let i = 0; i <= (22.5 - 10) * 2; i++) {
                    let new_date_full = new Date(new_date.setHours(10, 0, 0));
                    let time = new Date(new_date_full.setMinutes(new_date_full.getMinutes() + i * 30));
                    let new_hours = time.getHours();
                    let new_minutes = time.getMinutes();
                    if (new_minutes < 10) new_minutes = '0' + new_minutes;

                    if (delivery_time_modal) {
                        $('[data-delivery_time_list]').append('<div class="modal-time" data-delivery_time_option data-dismiss="modal" aria-label="Close" data-value="' + new_hours + ':' + new_minutes + ':00' + '">Завтра в ' + new_hours + ':' + new_minutes + '</div>');

                    } else {
                        $('.cart_delivery_time select').append('<option value="' + new_hours + ':' + new_minutes + ':00' + '">Завтра в ' + new_hours + ':' + new_minutes + '</option>');

                    }

                }
            }
        }

        $('[data-delivery_time_option]').click(function () {
            $('#order_time').val($(this).attr('data-value'));
            $('.delivery-new-address-time').text($(this).text()).css('color', 'black')
        })
        // ---------- ---------- ---------- Селект времени заказа - конец ---------- ---------- ----------

        // ---------- ---------- Скрытие списка улиц ---------- ----------
        // $(document).on('input', '.select2-search__field', function () {
        //     if ($(this).val() === '' || $(this).val() === '-') {
        //         $('.select2-results__options').css('display', 'none');
        //     } else {
        //         $('.select2-results__options').css('display', 'block');
        //     }
        // })

        // ---------- ---------- Скрытие селектора сохраненного адреса ---------- ----------
        let address_options = $.map($('#delivery_select_address option'), function (e) {
            return e.value;
        });
        if (address_options.length === 1) {
            $('.save_address').css('display', 'none')
        }
    }
    // ---------- ---------- ---------- Страница корзины - конец ---------- ---------- ----------

    // --- semantic-ui ---
    let content = [];
    let address_array = [];
    $('#delivery_street_list option').each(function () {
        let option = $(this).val();
        address_array.push(option)
    })


    for (let i = 0; i <= address_array.length; i++) {
        // address_obj = "{title:" + "'" + address_array[i] + "'}";
        // content.push(address_obj);
        let address_obj = {};
        address_obj['title'] = address_array[i];
        content.push(address_obj);
    }
    $('.ui.search')
        .search({
            source: content,
            error: {
                source: 'Не удалось найти. Источник не использовался, и модуль API не был включен',
                noResults: 'Улица не найдена',
                logging: 'Ошибка в журнале отладки, выход',
                noTemplate: 'Действительное имя шаблона не указано',
                serverError: 'Ошибка при запросе к серверу',
                maxResults: 'Результаты должны быть массивом, чтобы использовать настройку maxResults',
                method: 'Метод, который вы вызвали, не определен'
            },
            onResultsClose: function () {
                setTimeout(function () {
                    $('#delivery_street').trigger('change')

                }, 200)
            },
        });
    $('#delivery_select_address').dropdown();
    $('#order_time').dropdown('refresh');
    $('#takeaway_terminal').dropdown('refresh');

    $('.map_btn').click(function () {
        $(this).toggleClass('map_btn--active');
        $('#map_wrapper').slideToggle(300);
        $('#delivery_street, #delivery_home').trigger('change');
    })


    // ---------- ---------- ---------- Информирование о добавлении товара ---------- ---------- ----------
    function add_product_popup() {
        let product_container = $(this).closest('[data-product_container]');
        product_container.find('.added_item').addClass('added_item-active');
        setTimeout(delete_add_product_popup, 1000);

        function delete_add_product_popup() {
            product_container.find('.added_item').removeClass('added_item-active');
        }
    }

    // ---------- ---------- ---------- Информирование о прибавлении товара ---------- ---------- ----------
    function inc_product_popup() {
        let product_container = $(this).closest('[data-product_container]');
        product_container.find('.increased_item').addClass('added_item-active');
        setTimeout(delete_add_product_popup, 2000);

        function delete_add_product_popup() {
            product_container.find('.increased_item').removeClass('added_item-active');
        }
    }

    // ---------- ---------- ---------- Информирование об удалении товара ---------- ---------- ----------
    function del_product_popup() {
        let product_container = $(this).closest('[data-product_container]');
        product_container.find('.deleted_item').addClass('added_item-active');
        setTimeout(delete_add_product_popup, 2000);

        function delete_add_product_popup() {
            product_container.find('.deleted_item').removeClass('added_item-active');
        }
    }


    // ---------- ---------- ---------- ПРОМОКОДЫ 2.0 - начало ---------- ---------- ----------

    // ---------- ---------- ПРОМОКОД НА ГЛАВНОЙ и + на ТИПОВОЙ ---------- ----------
    let promocode_field = '',

        btn_promocode_apply = $('[data-promocode_apply]'),
        btn_promocode_cancel = $('[data-promocode_cancel]'),
        promocode_field_dom = $('[data-promocode_field]'),

        promocode_main_tooltip = $('.main-promocode__tooltip'),
        promocode_main_message = $('.main-promocode__tooltip .message_tooltip'),
        icon_wrong = '<img src="/assets/img/icon_wrong.svg" alt="" width="18" height="18">',
        icon_success = '<img src="/assets/img/icon_success.svg" alt="" width="18" height="18">',
        icon_warning = '<img src="/assets/img/icon_warning.svg" alt="" width="18" height="18">',

        promocode_cart_message = $('.cart_promo_discount');


    //Записать промокод в localStorage
    /*$('.promo_btn_empty, .promo_cart_btn_empty').on('click', function () {


        promocode_field = $('#promocode_value').val() || $('#promo').val();
        if (promocode_field === '') {
            promocode_main_message.html(icon_warning + 'Необходимо ввести промокод');
            promocode_main_tooltip.css("display", "block");

        } else {
            $.ajax({
                url: api_url + 'promokod',
                async: true,
                data: {
                    promo: promocode_field,
                    sid: js_cart['sid'],
                },
                method: "POST",
                success: function (data) {
                    console.log('Ajax success');

                    if (data.status === 'fail') { //промокод недействителен
                        localStorage.removeItem('promocode');
                        localStorage.removeItem('promocode_type');

                        promocode_main_message.html(icon_wrong + data.message);
                        promocode_main_tooltip.css('display', 'block');
                    }

                    else if (data.status === 'ok' && data.type === 'full_cart') { //изменение цены заказа
                        localStorage.setItem('promocode', promocode_field);
                        localStorage.setItem('promocode_type', data.type);

                        promocode_main_message.html(icon_success + data.message);
                        promocode_main_tooltip.css("display", "block");

                        promocode_field_dom
                            .addClass('promocode_not_empty')
                            .removeClass('promocode_empty')
                            .prop("readonly", true);

                        $('.promo_btn_not_empty').css('display', 'block');
                        $('.promo_btn_empty').css('display', 'none');

                        update_total_price(data.discount, data.typeDiscount);
                        let divs = [];
                        let sum = 0;
                        data.item.forEach(e =>{
                            let div = $($('.cart-item')[0]).clone();
                            $($(div).find('img')[0]).attr('src', e[0].photo);
                            // console.log(e);
                            // $(div).find('img')[0].src = e[0].photo;
                            // console.log($($(div).find('img')[0]));
                            $($(div).find('h3')[0]).text(e[0].name);
                            $($(div).find('.price')[0]).text(e[0].new_price + ' &#8381;');
                            $($(div).find('.item_sum').children()[0]).text(e[0].new_price);
                            // $($(div).find('p')[0]).attr('html', e.name);
                            sum += e[0].new_price;
                            divs.push(div);
                        })
                        $('.cart_list').empty();
                        divs.forEach(e => {
                            $('.cart_list').append(e);
                        });
                        let old_total_sum = parseFloat($('.total_sum').html());
                        if(old_total_sum != sum){
                            $('.total_sum').html(`<s>${old_total_sum}</s> ${sum}`);
                        }
                    }
                    else if (data.status === 'ok' && data.type === 'product_cart') { //изменение цены товара в коризне
                        promocode_main_message.html(icon_success + data.message);
                        promocode_main_tooltip.css("display", "block");

                        promocode_field_dom
                            .val(localStorage.getItem('promocode'))
                            .addClass('promocode_not_empty')
                            .removeClass('promocode_empty')
                            .prop("readonly", true);

                        $('.promo_btn_not_empty').css('display', 'block');
                        $('.promo_btn_empty').css('display', 'none');

                        localStorage.setItem('promocode', promocode_field);
                        localStorage.setItem('promocode_type', data.type);



                        update_total_price(data.discount.new_price*data.discount.count);

                    }
                    else {
                        promocode_main_message.html(icon_warning + 'Извините, произошла ошибка, попробуйте ввести промокод позднее.');
                        promocode_main_tooltip.css("display", "block");
                    }
                }
            });


        }

    })*/


    // ---------- ---------- ПРОМОКОД В localStorage ---------- ----------
    //проверка промокода в localStorage
    if (localStorage.getItem('promocode') && localStorage.getItem('promocode') !== '') { //промокод есть в localStorage
        check_promocode(localStorage.getItem('promocode'));
    } else { //промокода нет в localStorage
        localStorage.removeItem('promocode');
        localStorage.removeItem('promocode_type');

        promocode_field_dom
            .val('').trigger('change')
            .addClass('promocode_empty')
            .removeClass('promocode_not_empty')
            .prop("readonly", false);

        btn_promocode_cancel.css('display', 'none');
        btn_promocode_apply.css('display', 'block');
    }


    // ---------- ---------- ВВОД И ПРОВЕРКА ПРОМОКОДА ---------- ----------
    promocode_field_dom.on('change', function () {
        promocode_field = $(this).val().replace(/\s/g, '');
    })

    btn_promocode_apply.click(function () {
        if (promocode_field === '') { // если поле пустое
            if (window.location.pathname === '/') {
                promocode_main_message.html(icon_warning + 'Необходимо ввести промокод');
                promocode_main_tooltip.css("display", "block");
            } else if (window.location.pathname === '/cart') {
                promocode_field_dom.addClass('promocode_wrong');
                setTimeout(delete_shake, 500);

                function delete_shake() {
                    promocode_field_dom.removeClass('promocode_wrong');
                }
            }

        } else {
            check_promocode();
        }
    })


    // ---------- ---------- ОТМЕНА И УДАЛЕНИЕ ПРОМОКОДА ---------- ----------
    btn_promocode_cancel.on('click', function () {
        localStorage.removeItem("promocode");
        localStorage.removeItem("promocode_type");

        promocode_field_dom
            .val('').trigger('change')
            .addClass('promocode_empty')
            .removeClass('promocode_not_empty')
            .prop("readonly", false);

        btn_promocode_cancel.css('display', 'none');
        btn_promocode_apply.css('display', 'block');

        if (window.location.pathname === '/') {
            promocode_main_tooltip.css("display", "none");
        } else if (window.location.pathname === '/cart') {
            promocode_cart_message.hide();
            promocode_field_dom.show();

            document.querySelectorAll('.cart-item_promo').forEach(function (e) {
                e.remove()
            })
        }
        update_total_price()
    })

    //закрытие тултипа промокода на главной
    $('.close_tooltip').click(function () {
        promocode_main_tooltip.css('display', 'none')
    })
    // закрытие тултипа на главной нажатием на в любое место
    // $(document).mouseup(function (e) {
    //     var tooltip = $('.tooltip_false_promocode');
    //     if (!tooltip.is(e.target) && tooltip.has(e.target).length === 0) {
    //         tooltip.css("display", "none");
    //     }
    // });

    function check_promocode(param) {
        let old_order_amount = '';
        if (window.location.pathname === '/cart') {
            let old_order_amount = document.querySelector('[data-bind="cart.total"]').innerHTML;
        }

        let promo_word = (param) ? param : promocode_field;

        $.ajax({
            url: api_url + 'promokod',
            async: true,
            data: {
                promo: promo_word,
                sid: js_cart['sid'],
            },
            method: "POST",
            success: function (data) {

                if (data.status === 'fail' || data.status === 'error') { //Ошибка с промокодом
                    localStorage.removeItem('promocode');
                    localStorage.removeItem('promocode_type');

                    promocode_field_dom
                        .val('').trigger('change')
                        .addClass('promocode_empty')
                        .removeClass('promocode_not_empty')
                        .prop("readonly", false);

                    btn_promocode_cancel.css('display', 'none');
                    btn_promocode_apply.css('display', 'block');

                    if (window.location.pathname === '/') {
                        promocode_main_message.html(icon_warning + data.message);
                        promocode_main_tooltip.css("display", "block");
                    } else if (window.location.pathname === '/cart') {
                        promocode_cart_message.text(data.message).show();
                        promocode_field_dom.show();

                        document.querySelectorAll('.cart-item_promo').forEach(function (e) {
                            e.remove()
                        })
                    }


                    update_total_price();
                } else if (data.status === 'ok' && data.type === 'cart') { //изменение цены заказа
                    if (param) {
                        promocode_field_dom.val(param).trigger('change');
                    }
                    localStorage.setItem('promocode', promocode_field);
                    localStorage.setItem('promocode_type', data.type);

                    promocode_field_dom
                        .addClass('promocode_not_empty')
                        .removeClass('promocode_empty')
                        .prop("readonly", true);

                    btn_promocode_cancel.css('display', 'block');
                    btn_promocode_apply.css('display', 'none');

                    if (window.location.pathname === '/') {
                        promocode_main_message.html(icon_success + data.name);
                        promocode_main_tooltip.css("display", "block");

                    } else if (window.location.pathname === '/cart') {
                        promocode_field_dom.hide();

                        promocode_cart_message.text(data.name).show();

                        let div_old_order_amount = document.createElement('div');
                        div_old_order_amount.className = 'old_total_sum';
                        div_old_order_amount.innerHTML = old_order_amount;
                        div_old_order_amount.style.textDecoration = 'line-through';
                        //document.querySelector('.cart_total .total .total_sum').before(div_old_order_amount);
                    }

                    update_total_price(data.value, data.typeDiscount);
                } else if (data.status === 'ok' && data.type === 'products') { //изменение цены товара в коризне
                    if (param) {
                        promocode_field_dom.val(param).trigger('change');
                    }
                    localStorage.setItem('promocode', promocode_field);
                    localStorage.setItem('promocode_type', data.type);

                    promocode_field_dom
                        .addClass('promocode_not_empty')
                        .removeClass('promocode_empty')
                        .prop("readonly", true);

                    btn_promocode_cancel.css('display', 'block');
                    btn_promocode_apply.css('display', 'none');

                    if (window.location.pathname === '/') {
                        promocode_main_message.html(icon_success + data.name);
                        promocode_main_tooltip.css("display", "block");

                    } else if (window.location.pathname === '/cart') {

                        promocode_field_dom.hide();

                        promocode_cart_message.text(data.name).show();

                        let divs = [];
                        let sum = 0;

                        data.products.forEach(e => {

                            let div_cart_item = document.createElement('div');
                            div_cart_item.className = 'cart-item cart-item_promo';

                            let a_photo = document.createElement('a');
                            a_photo.className = 'cart-photo';
                            let img_photo = document.createElement('img');
                            img_photo.setAttribute('src', data.photo);
                            a_photo.append(img_photo);
                            div_cart_item.append(a_photo);

                            let a_name = document.createElement('a');
                            a_name.className = 'cart-name';
                            let h3_name = document.createElement('h3');
                            h3_name.innerHTML = 'Товар по промокоду';
                            let span_price = document.createElement('span');
                            span_price.className = 'price';
                            a_name.append(h3_name, span_price);
                            div_cart_item.append(a_name);

                            let div_cart_desc = document.createElement('div');
                            div_cart_desc.className = 'cart-desc';
                            let p_cart_desc = document.createElement('p');
                            p_cart_desc.innerHTML = data.name;
                            div_cart_desc.append(p_cart_desc);
                            div_cart_item.append(div_cart_desc);

                            let div_cart_item_nav = document.createElement('div');
                            div_cart_item_nav.className = 'cart-item-nav';
                            let div_item_sum = document.createElement('div');
                            div_item_sum.className = 'item_sum';
                            let span_item_sum = document.createElement('span');
                            span_item_sum.innerHTML = data.price + ' &#8381;';
                            div_item_sum.append(span_item_sum);
                            div_cart_item_nav.append(div_item_sum);
                            div_cart_item.append(div_cart_item_nav);

                            divs.push(div_cart_item);
                        })


                        divs.forEach(e => {
                            $('.cart_list').append(e);
                        });
                    }

                    // TODO-aidar обновление цены с учетом акционного товара
                    update_total_price(data.price);

                } else {
                    localStorage.removeItem('promocode');
                    localStorage.removeItem('promocode_type');

                    if (window.location.pathname === '/') {
                        promocode_main_message.html(icon_success + 'Извините, произошла ошибка, попробуйте ввести промокод позднее.');
                        promocode_main_tooltip.css("display", "block");

                    } else if (window.location.pathname === '/cart') {
                        promocode_cart_message.text('Извините, произошла ошибка, попробуйте ввести промокод позднее.').show();
                    }
                }
            },

        })
    }

    // ---------- ---------- ---------- ПРОМОКОДЫ 2.0 - конец ---------- ---------- ----------


    // ---------- ---------- ---------- ПРОВЕРКА АДРЕСА - начало ---------- ---------- ----------
    if(window.location.pathname === '/') {
        let check_address_flag = true;
        let check_home_flag = true;

        //Модалка проверка адреса
        $('.check-street_btn').click(function () {
            $('.check-street_modal-container').addClass('active');
            setTimeout(function () {
                $('.check-street_modal').addClass('active');
            }, 100)

            //формирование списка
            if (check_address_flag) {
                $.ajax({
                    url: api_url + 'address',
                    async: true,
                    data: {
                        action: 'listStreets',
                        sid: js_cart['sid'],
                    },
                    method: "POST",
                    success: function (data) {
                        let street_list = [];
                        for (let i = 0; i <= data.length; i++) {
                            let address_obj = {};
                            address_obj['title'] = data[i];
                            street_list.push(address_obj);
                        }

                        $('.ui.search')
                            .search({
                                source: street_list,
                                error: {
                                    source: 'Не удалось найти. Источник не использовался, и модуль API не был включен',
                                    noResults: 'Улица не найдена',
                                    logging: 'Ошибка в журнале отладки, выход',
                                    noTemplate: 'Действительное имя шаблона не указано',
                                    serverError: 'Ошибка при запросе к серверу',
                                    maxResults: 'Результаты должны быть массивом, чтобы использовать настройку maxResults',
                                    method: 'Метод, который вы вызвали, не определен'
                                },
                                onResultsClose: function () {
                                    setTimeout(function () {
                                        $('#delivery_street').trigger('change')

                                    }, 200)
                                },
                            });

                        check_address_flag = false;
                        $('.check-street_loader').hide();
                        $('.check-street_modal-view').addClass('active')
                    }
                })

            }
        })

        $('.check-street_modal-overlay, .check-street_modal-closer').click(function () {
            $('.check-street_modal').removeClass('active');

            setTimeout(function () {
                $('.check-street_modal-container').removeClass('active');
            }, 200)
        })



    }

    // ---------- ---------- ---------- ПРОВЕРКА АДРЕСА - конец ---------- ---------- ----------

    $('#test1').click(function () {
        console.log(sessionStorage)
    })


    //cart widget vue
    // let cart_widget = new Vue({
    //     el: '#vue_cart_widget',
    // });


    $('.confirm__head_back').on('click', function () {
        $('[data-confirm_stage="2"]').hide();
        $('[data-confirm_stage="1"]').show();
        $('#payment_bonus').val('0').trigger('change');

        if ($('#volume')) {
            $('.slider-output, .slider-thumb').css('left', '0');
            $('.slider-level').css('width', '0');
            $('.slider-output').text('0');
        }
    });


    //handlers
    $('.fullpic-row-back').on('click', hide_product_bg_photo);
    $('.showpic').on('click', show_product_bg_photo);

    //Авторизация 2.0 - ??? запуск при док реди ???
    // $('[data-signup_go_stage="1"]').on('click', signup_go_stage1);
    $('[data-signup_go_stage="1"]').on('click', signup_go_stage1);
    $('[data-signup_go_stage="2"]').on('click', signup_go_stage4);
    $('[data-signup_go_stage="3"]').on('click', signup_go_stage3);
    $('[data-signup_go_stage="4"]').on('click', signup_go_stage4);
    $('[data-signup_go_stage="signup_repeat_code"]').on('click', signup_repeat_code);

    //Очистка корзины
    $('[data-clear_cart]').on('click', clear_cart);

    //Удаление продукта из корзины
    $('[data-clear_product]').on('click', clear_product);

    //Выбор сохраненного адреса в оформлении
    $('#delivery_select_address').on('change', change_delivery_address);
    $('[data-address_select]').on('click', change_delivery_address_m)

    //Попап корзины в header
    $('[data-widget_cart]').on('click', open_widget_cart);

    //Попапы изменения товара
    $('body').on('click', '[data-product_add_popup]', add_product_popup);
    $('body').on('click', '[data-product_inc_popup]', inc_product_popup);
    $('body').on('click', '[data-product_del_popup]', del_product_popup);

    //$('[data-product_add]').on('click', add_product);
    //('.main_prod, #previewProduct1').on('click', '[data-product_add]', add_product);
    $('body').on('click', '[data-product_add]', add_product);

    $('body').on('click', '[data-product_add_in_cart]', add_product);
    $('body').on('click', '.filterProducts', filter_product);


    //$('[data-product_inc]').on('click', inc_product);
    //$('[data-product_del]').on('click', del_product);
    //$('.main_prod, #previewProduct1').on('click', '[data-product_inc]', inc_product);
    //$('.main_prod, #previewProduct1').on('click', '[data-product_del]', del_product);

    $('body').on('click', '[data-product_inc]', inc_product);
    $('body').on('click', '[data-product_del]', del_product);

    $('[data-confirm_go_stage="1"]').on('click', confirm_go_stage1);
    $('[data-confirm_go_stage="2"]').on('click', confirm_go_stage2);
    // $('[data-confirm_go_stage="3"]').on('click', confirm_go_stage3);
    // $('.goToStage3[data-confirm_go_stage="3"]').on('click', function () {

    $('.goToStage3').on('click', function () {$(this).removeClass('goToStage3');});
    $('.goToStage3').on('click', confirm_go_stage3);

    $('[data-confirm_go_stage="auth"]').on('click', confirm_go_stage_auth);
    $('[data-confirm_go_stage="confirm_auth"]').on('click', confirm_auth);
    $('[data-confirm_go_stage="confirm_reg"]').on('click', confirm_reg);            // todo
    $('[data-confirm_go_stage="2.auth"]').on('click', confirm_confirm_auth);
    $('[data-confirm_go_stage="2.reg"]').on('click', confirm_confirm_reg);          // todo

    $('[data-confirm_go_stage="3.enter_card"]').on('click', confirm_enter_card);    // todo
    // $('[data-confirm_go_stage="3"]').on('click', confirm_enter_card);               // todo

    $('#confirm_phone').on('change.confirm_phone', update_user_bonus).triggerHandler('change.confirm_phone');
    $('#confirm_delivery').on('change.confirm_delivery', update_delivery_fields).triggerHandler('change.confirm_delivery');
    $('.delivery_button').on('click.change_delivery', update_delivery_fields).eq(0).triggerHandler('click.change_delivery');

    $('.delivery_button').on('click', function () {
        $('.delivery_button').removeClass('active');
        $(this).addClass('active');
    });
    $('.payment_button ').on('click', function () {
        $('.payment_button ').removeClass('active');
        $(this).addClass('active');
    });


    $('select[name^=modifier]').on('change.modifier_kombo_change', update_kombo_pizza_modifier);
    $('select[name^=modifier]').on('change.modifier_change', function (e) {
        let product_container = $(this).closest(selector_product_container);

        //update kombo hidden modifier, that appear if select equal modifiers
        // update_kombo_pizza_modifier.call(this, e);

        //update count of product
        update_pizza_count(product_container);

        //update product price with modifiers
        product_container
            .find(selector_product_price_label)
            .html(
                parseFloat(product_container.data('product_price'))
                + parseFloat(
                [...get_applied_modifiers(product_container).found]
                    .reduce((sum, pm) => {
                        return parseFloat(sum) + parseFloat(pm.modifier_price)
                    }, 0)
                )
            );
    });

    $('#payment_bonus').on('change', function (e) {

    });


    //post init
    {
        update_pizza_count($('[data-product_page]'));
    }

    $('#pills-payment-tab-6').click(function () {
        $('#pills-payment-5').hide();
    });

    $('#pills-payment-tab-7').click(function () {
        $('#pills-payment-5').hide();
    });

    $('#pills-payment-tab-5').on('click', function () {
        $('#pills-payment-5').show();
    });



});

