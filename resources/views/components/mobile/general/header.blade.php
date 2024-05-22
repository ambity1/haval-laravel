<header>
    <div class="sticky-header overflow-visible">
        <div class="header_mid">
            <div class="container d-flex justify-content-between align-items-center">
                <div class="logo d-flex align-items-center">
                    <a href="/" id="logo" class="d-flex flex-row align-items-center">
                        <img src="{{asset('/media/header/logo.svg')}}">
                    </a>
                </div>
                <div class="header_mid-burger d-flex align-items-center justify-content-center"
                     onclick=" document.querySelector('body').style='overflow-y: hidden;'; document.querySelector('.sidenav').classList.add('active');">
                    <div></div>
                </div>
            </div>
        </div>
    </div>
</header>
