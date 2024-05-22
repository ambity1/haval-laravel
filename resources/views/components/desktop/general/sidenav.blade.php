<div class="sidenav">
    <div class="sidenav-block d-flex flex-column">
        <div class="sidenav-block-desc d-flex flex-column">
            <div class="d-flex align-items-center justify-content-end">
                <div class="sidenav-block-close" onclick="document.querySelector('.sidenav').classList.remove('active'); document.querySelector('body').style='overflow-y: auto;';">
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div class="modelsList d-flex flex-column">
                <p class="text-uppercase">Модельный ряд</p>
                <div class="d-flex align-items-start">
                    <div class="d-flex flex-column">
                        <a href="/HAVAL-M6"><div>HAVAL M6</div></a>
                        <a href="/HAVAL-DARGO-X"><div>HAVAL DARGO X</div></a>
                        <a href="/HAVAL-DARGO"><div>HAVAL DARGO</div></a>
                        <a href="/HAVAL-JOLION-NEW"><div>НОВЫЙ HAVAL JOLION</div></a>
                        <a href="/HAVAL-JOLION"><div>HAVAL JOLION</div></a>
                        <a href="/HAVAL-F7"><div>HAVAL F7</div></a>
                    </div>
                    <div class="d-flex flex-column">
                        <a href="/HAVAL-F7X"><div>HAVAL F7X</div></a>
                        <!--                        <a href="/HAVAL-H9"><div>HAVAL H9</div></a>-->
                        <a href="/GWM-POER"><div>GWM POER</div></a>
                        <a href="/GWM-POER-KINGKONG"><div>GWM POER KINGKONG</div></a>
                    </div>
                </div>
            </div>
            <a href="/about" class="text-uppercase">
                О дилере
            </a>
            <a href="/news" class="text-uppercase">
                Новости
            </a>
            <div class="sidenav-block-contacts d-flex flex-column">
                <p class="text-uppercase">Контакты</p>
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
                <div class="btn btn-black-trnsp askMe askMeSpec" onclick="document.querySelector('.sidenav').classList.remove('active'); document.querySelector('body').style='overflow-y: auto;';">Получить спецпредложение</div>
                <div class="btn btn-trnsp-black askMe askMeTestDrive" onclick="document.querySelector('.sidenav').classList.remove('active'); document.querySelector('body').style='overflow-y: auto;';">Записаться на тест-драйв</div>
            </div>
        </div>
    </div>
</div>
