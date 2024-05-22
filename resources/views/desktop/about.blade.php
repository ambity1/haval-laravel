<html lang="ru">
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>О ДИЛЕРЕ | HAVAL БАШАВТОКОМ</title>
    <meta name="description" content="Группа компаний &quot;Башавтоком&quot; - это крупнейший дилерский альянс в РБ, история которого насчитывает более 30 лет и 100 000 клиентов. Для информации звоните: +7 (347) 246-65-47. Подробная информация у официального дилера HAVAL Башавтоком">
    <meta name="keywords" content="">

    <meta property="og:title" content="О ДИЛЕРЕ | HAVAL БАШАВТОКОМ">
    <meta property="og:description" content="Группа компаний &quot;Башавтоком&quot; - это крупнейший дилерский альянс в РБ, история которого насчитывает более 30 лет и 100 000 клиентов. Для информации звоните: +7 (347) 246-65-47. Подробная информация у официального дилера HAVAL Башавтоком">
    <meta property="og:url" content="https://haval.bashauto.com/">
    <meta property="og:image" content="{{asset('/media/about_pic2.jpg')}}">
    <meta property="og:type" content="website">

    <meta itemprop="name" content="О ДИЛЕРЕ | HAVAL БАШАВТОКОМ">
    <meta itemprop="description" content="Группа компаний &quot;Башавтоком&quot; - это крупнейший дилерский альянс в РБ, история которого насчитывает более 30 лет и 100 000 клиентов. Для информации звоните: +7 (347) 246-65-47. Подробная информация у официального дилера HAVAL Башавтоком">
    <meta itemprop="image" content="{{asset('/media/about_pic2.jpg')}}">

    <meta charset="UTF-8">
    <title>HAVAL Auto</title>
    <link rel="stylesheet" href="{{asset('/desktop/css/bootstrap.min.css')}}">
    <link rel="stylesheet" href="{{asset('/swiper-bundle.min.css')}}">
    <link rel="stylesheet" href="{{asset('/css/desktop/style.css?v=19')}}">
    <link rel="stylesheet" href="{{asset('/fonts/PFDinDisplayPro/stylesheet.css')}}">
    <link rel="stylesheet" href="{{asset('/fonts/haval/stylesheet.css')}}">
    <script type="text/javascript" async="" id="tmr-code" src="https://top-fwz1.mail.ru/js/code.js"></script>
    <script async="" src="https://mc.yandex.ru/metrika/tag.js"></script>
    <script src="{{asset('/swiper-bundle.min.js')}}"></script>
    <link rel="apple-touch-icon" sizes="180x180" href="{{asset('/favicon/apple-touch-icon.png')}}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{asset('/favicon/favicon-32x32.png')}}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{asset('/favicon/favicon-16x16.png')}}">
    <link rel="manifest" href="{{asset('/favicon/site.webmanifest')}}">
    <link rel="mask-icon" href="{{asset('/favicon/safari-pinned-tab.svg')}}" color="#000001">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <!-- Yandex.Metrika counter -->
    <script type="text/javascript">
        (function (m, e, t, r, i, k, a) {
            m[i] = m[i] || function () {
                (m[i].a = m[i].a || []).push(arguments)
            };
            m[i].l = 1 * new Date();
            for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) {
                    return;
                }
            }
            k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
        })
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(95565168, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
        });
    </script>
    <noscript>
        <div><img src="https://mc.yandex.ru/watch/95565168" style="position:absolute; left:-9999px;" alt=""/></div>
    </noscript>
    <!-- /Yandex.Metrika counter -->
    <!-- Top.Mail.Ru counter -->
    <script type="text/javascript">
        var _tmr = window._tmr || (window._tmr = []);
        _tmr.push({id: "3419230", type: "pageView", start: (new Date()).getTime()});
        (function (d, w, id) {
            if (d.getElementById(id)) return;
            var ts = d.createElement("script");
            ts.type = "text/javascript";
            ts.async = true;
            ts.id = id;
            ts.src = "https://top-fwz1.mail.ru/js/code.js";
            var f = function () {
                var s = d.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(ts, s);
            };
            if (w.opera == "[object Opera]") {
                d.addEventListener("DOMContentLoaded", f, false);
            } else {
                f();
            }
        })(document, window, "tmr-code");
    </script>
    <noscript>
        <div><img src="https://top-fwz1.mail.ru/counter?id=3419230;js=na" style="position:absolute;left:-9999px;"
                  alt="Top.Mail.Ru"/></div>
    </noscript>
    <!-- /Top.Mail.Ru counter -->
</head>
<body class="" id="ordinary-page">
@include('components.desktop.general.header')
@include('components.desktop.general.sticky-header')
@include('components.desktop.about.aboutPage-head')
@include('components.desktop.about.aboutPage-info')
@include('components.desktop.general.pageChange')
@include('components.desktop.general.news')

<main class="aboutPage">
    @include('components.desktop.general.contacts_main')
</main>

@include('components.desktop.general.footer')
@include('components.desktop.general.sidenav')
@include('components.desktop.general.AskMeSpec')
@include('components.desktop.general.stickyPhoneWrap')

@include('components.desktop.general.videoModal')

<script src="{{asset('/js/inputmask.min.js')}}"></script>
<script src="{{asset('/desktop/js/bootstrap.min.js')}}"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        if (window.pageYOffset >= 5) {
            document.querySelector('.sticky-header').classList.add('active');
        }
        document.addEventListener("scroll", function () {
            if (window.pageYOffset >= 5) {
                document.querySelector('.sticky-header').classList.add('active');
            } else {
                document.querySelector('.sticky-header').classList.remove('active');
            }
        });
        const swiper = new Swiper('.main_slider', {
            direction: 'horizontal',
            centeredSlides: true,
            loop: true,
            noSwipingSelector: 'a',
            /*  autoplay: {
                  delay: 2500,
                  disableOnInteraction: false,
              },*/
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

        const portfolio = new Swiper('.portfolio-slider', {
            direction: 'horizontal',
            slidesPerView: 'auto',
            breakpoints: {
                1000: {
                    slidesPerView: 3,
                }
            },
            loopFillGroupBlank: false,
            loop: true,
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

        let overlay = document.querySelector('.sidenav');
        let overBlock = document.querySelector('.sidenav-block');
        overlay.addEventListener('click', (e) => {
            const withinBoundaries = e.composedPath().includes(overBlock);
            if (!withinBoundaries) {
                overlay.classList.remove('active');
                document.querySelector('body').style = 'overflow-y: auto;';
            }
        });

        function clamper() {
            let clamp = document.querySelectorAll('.portfolio-slider .block p');
            let orient = document.querySelectorAll('.portfolio-slider .block h3');
            clamp.forEach((item, i) => {
                //item.style='-webkit-line-clamp: unset';
                item.style = '-webkit-line-clamp:' + Math.trunc((166 - orient[i].offsetHeight - 10) / 18);
            });
        }

        clamper();
        window.addEventListener('resize', () => {
            clamper();
        });

        let modal = document.querySelector('.ask-overlay.ask-call');
        let askMe = [...document.querySelectorAll('.askMe')];
        let overModal = document.querySelector('.ask-block-bckg');
        let overModal2 = document.querySelector('.ask-block-content');
        let close = document.querySelector('.ask-block-close');
        askMe.forEach(function (item) {
            item.addEventListener('click', () => {
                modal.classList.remove('fromAskMeConsultation', 'fromAskMeTestDrive', 'fromAskMeSpec');
                if (item.classList.contains('askMeConsultation')) {
                    modal.querySelector('.request').innerText = "Заказать звонок";
                    modal.classList.add('fromAskMeConsultation');
                    modal.querySelector('.ask-block-bckg').style.backgroundImage = 'url(/media/modals/askMeConsultation.jpg)';
                    modal.querySelector('.ask-block-bckg').style.backgroundPosition = '65% center';
                }

                if (item.classList.contains('askMeTestDrive')) {
                    modal.querySelector('.request').innerText = "Запись на тест-драйв";
                    modal.classList.add('fromAskMeTestDrive');
                    modal.querySelector('.ask-block-bckg').style.backgroundImage = 'url(/media/modals/askMeTestDrive.jpg)';
                    modal.querySelector('.ask-block-bckg').style.backgroundPosition = '80% center';
                }
                if (item.classList.contains('askMeSpec')) {
                    modal.querySelector('.request').innerText = "Получить специальное предложение";
                    modal.classList.add('fromAskMeSpec');
                    modal.querySelector('.ask-block-bckg').style.backgroundImage = 'url(/media/modals/askMeSpec.jpg)';
                    modal.querySelector('.ask-block-bckg').style.backgroundPosition = '75% center';
                }
                if (item.classList.contains('askMeLising')) {
                    modal.querySelector('.request').innerText = "Получить специальные условия в лизинг";
                    modal.classList.add('fromAskMeLising');
                    modal.querySelector('.ask-block-bckg').style.backgroundImage = 'url(/media/modals/askMeLisingpop.jpg)';
                    modal.querySelector('.ask-block-bckg').style.backgroundPosition = '23% center';
                }
                if (item.classList.contains('askMeGosprogramma')) {
                    modal.querySelector('.request').innerText = "Узнать цену по акции";
                    modal.classList.add('fromAskMeGosprogramma');
                    modal.querySelector('.ask-block-bckg').style.backgroundImage = 'url(/media/modals/askMeGosprogramma.jpg)';
                    modal.querySelector('.ask-block-bckg').style.backgroundPosition = '23% center';
                }
                modal.style.display = 'flex';
                document.querySelector('body').style = 'overflow-y: hidden;';
            });
        });
        modal.addEventListener('click', (e) => {
            const withinBoundaries = e.composedPath().includes(overModal) || e.composedPath().includes(overModal2);
            if (!withinBoundaries) {
                modal.style = 'display: none';
                document.querySelector('body').style = 'overflow-y: auto;';
            }
        });
        close.addEventListener('click', (e) => {
            modal.style.display = 'none';
            document.querySelector('body').style = 'overflow-y: auto;';
        });

    })
</script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        let masked = document.querySelectorAll('.masked');
        masked.forEach(item => {
            Inputmask({"mask": "9 (999) 999 99 99"}).mask(item);
        });
    });
</script>
<script type="text/javascript" src="{{asset('/js/request.js')}}"></script>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        let dash = document.querySelector('.stages-dash div');
        if (dash) {
            function dashHeight() {
                let seed = document.querySelector('.seed').getBoundingClientRect();
                let bottom = document.querySelector('.stages-dash').getBoundingClientRect().bottom;
                dash.style.height = bottom - seed.top - (seed.bottom - seed.top) * 0.7 - (seed.left - dash.getBoundingClientRect().left) * 0.2679 + 'px';
            }

            dashHeight();
            window.addEventListener('resize', () => {
                dashHeight();
            });
        }
    });
</script>
<script>

    let offer = new Swiper(".about-swiper", {
        direction: 'horizontal',
        centeredSlides: true,
        loop: true,
        allowTouchMove: false,
        pagination: {
            el: ".about-block .swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
</script>
<script type="text/javascript" async="" src="https://top-fwz1.mail.ru/js/dyn-goal-config.js?ids=3419230"></script>
</body>
</html>
