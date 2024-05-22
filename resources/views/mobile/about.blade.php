<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>О ДИЛЕРЕ | HAVAL БАШАВТОКОМ</title>
    <meta name="description"
          content="Группа компаний &quot;Башавтоком&quot; - это крупнейший дилерский альянс в РБ, история которого насчитывает более 30 лет и 100 000 клиентов. Для информации звоните: +7 (347) 246-65-47. Подробная информация у официального дилера HAVAL Башавтоком">
    <meta name="keywords" content="">

    <meta property="og:title" content="О ДИЛЕРЕ | HAVAL БАШАВТОКОМ">
    <meta property="og:description"
          content="Группа компаний &quot;Башавтоком&quot; - это крупнейший дилерский альянс в РБ, история которого насчитывает более 30 лет и 100 000 клиентов. Для информации звоните: +7 (347) 246-65-47. Подробная информация у официального дилера HAVAL Башавтоком">
    <meta property="og:url" content="https://haval.bashauto.com/">
    <meta property="og:image" content="{{asset('/media/about_pic2.jpg')}}">
    <meta property="og:type" content="website">

    <meta itemprop="name" content="О ДИЛЕРЕ | HAVAL БАШАВТОКОМ">
    <meta itemprop="description"
          content="Группа компаний &quot;Башавтоком&quot; - это крупнейший дилерский альянс в РБ, история которого насчитывает более 30 лет и 100 000 клиентов. Для информации звоните: +7 (347) 246-65-47. Подробная информация у официального дилера HAVAL Башавтоком">
    <meta itemprop="image" content="{{asset('/media/about_pic2.jpg')}}">

    <meta charset="UTF-8">
    <title>HAVAL Auto</title>
    <link rel="stylesheet" href="{{asset('/desktop/css/bootstrap.min.css')}}">
    <link rel="stylesheet" href="{{asset('/swiper-bundle.min.css')}}">
    <link rel="stylesheet" href="{{asset('/css/mobile/style1.css?v=21')}}">
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
@include('components.mobile.general.header')
@include('components.mobile.about.aboutPage-head')
@include('components.mobile.about.aboutPage-info')
@include('components.mobile.general.pageChange')
@include('components.mobile.general.news')

<main class="fondPage">
    @include('components.mobile.general.contacts_main')
</main>

@include('components.mobile.general.footer')
@include('components.mobile.general.sidenav')
@include('components.mobile.general.ask')
@include('components.mobile.general.stickyPhoneWrap')

@include('components.mobile.general.videoModal')

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
        const swiper = new Swiper('.main_slider-slider', {
            direction: 'horizontal',
            centeredSlides: true,
            loop: true,
            allowTouchMove: true
        });

        const portfolio = new Swiper('.portfolio-slider', {
            direction: 'horizontal',
            slidesPerView: 'auto',
            breakpoints: {
                768: {
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

        function clamper() {
            let clamp = document.querySelectorAll('.portfolio-slider .block p');
            let orient = document.querySelectorAll('.portfolio-slider .block h3');
            clamp.forEach((item, i) => {
                item.style = '-webkit-line-clamp: ' + Math.trunc((166 - orient[i].offsetHeight - 10) / 18);
            });
        }

        clamper();
        window.addEventListener('resize', () => {
            clamper();
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

        let modal = document.querySelector('.ask-overlay.ask-call');
        let askMe = document.querySelectorAll('.askMe');
        let overModal = document.querySelector('.ask-block');
        let close = document.querySelector('.ask-block-close');
        askMe.forEach(function (item) {
            item.addEventListener('click', () => {
                modal.classList.remove('fromAskMeTestDrive', 'fromAskMeSpec', 'fromAskMeConsultation');
                if (item.classList.contains('askMeConsultation')) {
                    modal.querySelector('.request').innerText = "Заказать звонок";
                    modal.classList.add('fromAskMeConsultation');
                }
                if (item.classList.contains('askMeTestDrive')) {
                    modal.querySelector('.request').innerText = "Записаться на тест-драйв";
                    modal.classList.add('fromAskMeTestDrive');
                }
                if (item.classList.contains('askMeSpec')) {
                    modal.querySelector('.request').innerText = "Получить спецпредложение";
                    modal.classList.add('fromAskMeSpec');
                }
                if (item.classList.contains('askMeLising')) {
                    modal.querySelector('.request').innerText = "Получить специальные условия в лизинг";
                    modal.classList.add('fromAskMeLising');
                }
                if (item.classList.contains('askMeGosprogramma')) {
                    modal.querySelector('.request').innerText = "Узнать цену по акции";
                    modal.classList.add('fromAskMeGosprogramma');
                }
                modal.style.display = 'flex';
                document.querySelector('body').style.overflowY = 'hidden';
            });
        });
        modal.addEventListener('click', (e) => {
            const withinBoundaries = e.composedPath().includes(overModal);
            if (!withinBoundaries) {
                modal.style = 'display: none';
                document.querySelector('body').style.overflowY = null;
            }
        });
        close.addEventListener('click', (e) => {
            modal.style.display = 'none';
            document.querySelector('body').style.overflowY = null;
        });


        /*function contHeadFont(){
            let contHead = document.querySelector('.content_header-head h1');
            if(contHead.getBoundingClientRect().width > window.innerWidth - 60){
                contHead.style='font-size: 20px;';
            } else contHead.style='font-size: 26px;';
        }
        contHeadFont();
        window.addEventListener('resize', () =>{
            contHeadFont();
        });*/
    })
</script>
<script type="text/javascript" src="{{asset('/js/request.js')}}"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        let masked = document.querySelectorAll('.masked');
        masked.forEach(item => {
            Inputmask({"mask": "9 (999) 999 99 99"}).mask(item);
        });
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
