<div class="sidenav">
    <div class="sidenav-block d-flex flex-column">
        <div class="container">
            <div class="sidenav-block-desc d-flex flex-column">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="bash">
                        <img src="/media/header/bashavto_logo_n.svg" alt="">
                    </div>
                    <div class="sidenav-block-close d-flex align-items-center justify-content-center"
                         onclick="document.querySelector('.sidenav').classList.remove('active'); document.querySelector('body').style='overflow-y: auto;';">
                        <div></div>
                        <div></div>
                    </div>
                </div>
                <div class="modelsList d-flex flex-column">
                    <p class="text-uppercase">Модельный ряд</p>
                    <div class="d-flex flex-column">
                        <a href="/HAVAL-M6">HAVAL M6</a>
                        <a href="/HAVAL-DARGO-X">HAVAL DARGO X</a>
                        <a href="/HAVAL-DARGO">HAVAL DARGO</a>
                        <a href="/HAVAL-JOLION-NEW">НОВЫЙ HAVAL JOLION</a>
                        <a href="/HAVAL-JOLION">HAVAL JOLION</a>
                        <a href="/HAVAL-F7">HAVAL F7</a>
                        <a href="/HAVAL-F7X">HAVAL F7X</a>
                        <!--                        <a href="/HAVAL-H9">HAVAL H9</a>-->
                        <a href="/GWM-POER">GWM POER</a>
                        <a href="/GWM-POER-KINGKONG">GWM POER KINGKONG</a>
                    </div>
                </div>
                <a href="/about" class="text-uppercase">
                    О дилере
                </a>
                <a href="/news" class="text-uppercase">
                    Новости
                </a>
                <div class="sidenav-block-contacts d-flex flex-column">
                    <a href="/contacts" class="text-uppercase">Контакты</a>
                    <div class="d-flex flex-column">
                        <div>
                            <div class="d-flex align-items-center">
                                <div class="d-flex align-items-center">
                                    <img src="{{asset('/img/headericons/tel-b.svg')}}" alt="">
                                </div>
                                <p class="text-uppercase">Уфа, пр-кт Салавата Юлаева, 89</p>
                            </div>
                        </div>
                        <a href="tel:+73472466547">
                            <div class="d-flex align-items-center">
                                <div class="d-flex align-items-center">
                                    <img src="{{asset('/img/headericons/loc-b.svg')}}" alt="">
                                </div>
                                <p class="text-uppercase">+7 (347) 246-65-47</p>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="sidenav-block-btns d-flex flex-column align-items-start">
                    <div class="w-100 btn btn-black-trnsp askMe askMeSpec"
                         onclick="document.querySelector('.sidenav').classList.remove('active'); document.querySelector('body').style='overflow-y: auto;';">
                        Получить предложение
                    </div>
                    <div class="w-100 btn btn-trnsp-black askMe askMeTestDrive"
                         onclick="document.querySelector('.sidenav').classList.remove('active'); document.querySelector('body').style='overflow-y: auto;';">
                        Запись на тест-драйв
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
