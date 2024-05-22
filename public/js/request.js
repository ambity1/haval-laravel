document.addEventListener('DOMContentLoaded', () => {
    let thisModal = document.querySelector('.ask-overlay');
    let form = document.querySelector('.ask-block form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let data = new FormData(form);

        if (data.get('phone').split(/[-_()^\s*$]+/).join('').length === 11) {
            if (thisModal.classList.contains('fromAskMeConsultation')) {
                data.append('target', 'Заказать звонок');
                data.append('method', 'sendZayavka');
                try {
                    ym(95565168, 'reachGoal', 'consult');
                } catch (err) {
                    console.log('');
                }
            }

            if (thisModal.classList.contains('fromAskMeTestDrive')) {
                data.append('target', 'Запись на тест-драйв');
                data.append('method', 'sendZayavka');
                try {
                    ym(95565168, 'reachGoal', 'drive')
                } catch (err) {
                    console.log('');
                }
            }

            if (thisModal.classList.contains('fromAskMeSpec')) {
                data.append('target', 'Получить спецпредложение');
                data.append('method', 'sendZayavka');
                try {
                    ym(95565168, 'reachGoal', 'offer')
                } catch (err) {
                    console.log('');
                }
            }

            if (thisModal.classList.contains('fromAskMeLising')) {
                data.append('method', 'entity');
                try {
                    ym(95565168, 'reachGoal', 'lizing')
                } catch (err) {
                    console.log('');
                }
            }

            if (thisModal.classList.contains('fromAskMeGosprogramma')) {
                data.append('target', 'Госпрограмма новый Jolion в лизинг');
                data.append('method', 'sendZayavka');
                try {
                    ym(95565168, 'reachGoal', 'lizing')
                } catch (err) {
                    console.log('');
                }
            }

            form.querySelector('button').setAttribute('disabled', 'disabled');


            fetch('/api/request', {
                method: 'post',
                body: data
            }).then(resp => resp.json())
                .then(result => {
                    let wrap = document.createElement('div');
                    wrap.classList.add('d-flex', 'flex-column');
                    if (result.status === 'ok') {
                        wrap.innerHTML = '<p class="request">Спасибо!</p><p>Мы получили вашу заявку, скоро с вами свяжутся.</p>';
                    } else {
                        wrap.innerHTML = '<p class="request">Ошибка!</p><p>Попробуйте чуть позже.</p>';
                    }
                    form.remove();
                    document.querySelector('.ask-call .ask-block-content').append(wrap);
                })
        } else {
            alert('Заполните номер')
        }
    })
});
