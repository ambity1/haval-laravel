<?php

use Illuminate\Support\Facades\Route;
use Jenssegers\Agent\Agent;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.main');
    }
    return view('desktop.main');
});

Route::get('/about', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.about');
    }
    return view('desktop.about');
});

Route::get('/contacts', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.contacts');
    }
    return view('desktop.contacts');
});

Route::get('/HAVAL-M6', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.havalm6');
    }
    return view('desktop.havalm6');
});

Route::get('/HAVAL-DARGO-X', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.havaldargox');
    }
    return view('desktop.havaldargox');
});

Route::get('/HAVAL-DARGO', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.havaldargo');
    }
    return view('desktop.havaldargo');
});

Route::get('/HAVAL-JOLION-NEW', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.havaljolionnew');
    }
    return view('desktop.havaljolionnew');
});

Route::get('/HAVAL-JOLION', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.havaljolion');
    }
    return view('desktop.havaljolion');
});

Route::get('/HAVAL-F7', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.havalf7');
    }
    return view('desktop.havalf7');
});

Route::get('/GWM-POER-KINGKONG', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.gwmpoerkingkong');
    }
    return view('desktop.gwmpoerkingkong');
});

Route::get('/GWM-POER', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.gwmpoer');
    }
    return view('desktop.gwmpoer');
});

Route::get('/HAVAL-F7X', function () {
    $agent = new Agent();
    if ($agent->isMobile()) {
        return view('mobile.havalf7x');
    }
    return view('desktop.havalf7x');
});
