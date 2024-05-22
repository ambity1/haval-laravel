<?php

use App\Mail\EntityAppMail;
use App\Mail\GosAppMail;
use App\Mail\RouletteAppMail;
use App\Mail\ZayavkaMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


//Route::post('/request', function (Request $request) {
//    switch ($request['method']) {
//        case 'sendZayavka':
//            try {
//                Mail::to([
//                    'haval@bashauto.com',
//                    'r.gussamov@bashauto.com',
//                    'a.ismagilov@bashauto.com',
//                    'o.balyklova@bashauto.com',
//                    'el.bakirova@bashauto.com',
//                    'm.abzelilov@bashauto.com'
//                ])->send(new ZayavkaMail($request['name'], $request['phone'], $request['target']));
//            } catch (\Exception $e) {
//                Log::info($e->getMessage());
//                return response()->json(['status' => 'error', 'error' => $e->getMessage()], 500);
//            }
//
//            // Send Telegram message
//            $tg_token = '6420278819:AAGc1QWOW0jSI8Ca50JhHnRbxZiWhm6Z1Fc';
//            $tg_chat_id = '-4070476702';
//            $tg_message = "Новая заявка на сайте haval.bashauto.com (HAVAL)" . PHP_EOL . "Имя: {$request['name']}" . PHP_EOL .  "Телефон: {$request['phone']}" . PHP_EOL . "Цель: {$request['target']}";
//
//            $response = Http::post("https://api.telegram.org/bot{$tg_token}/sendMessage", [
//                'chat_id' => $tg_chat_id,
//                'text' => $tg_message
//            ]);
//
//            if ($response->failed()) {
//                Log::info('Failed to send Telegram message');
//                return response()->json(['status' => 'error', 'error' => 'Failed to send Telegram message'], 500);
//            }
//
//            return response()->json(['status' => 'ok']);
//        case 'entity':
//            try {
//                Mail::to('aa4052783@gmail.com')
//                    ->send(new EntityAppMail($request['name'], $request['phone']));
//            } catch (\Exception $e) {
//                return response()->json(['status' => 'error', 'error' => $e->getMessage()], 500);
//            }
//
//            // Send Telegram message
//            $tg_token = '6330040075:AAGc8xJeYtYIU9N2RboJ7hkxaaxJ2locIqg';
//            $tg_chat_id = '-4070476702';
//            $tg_message = "Новая заявка от юридического лица (лизинг для юр лиц) на сайте haval.bashauto.com (HAVAL)" . PHP_EOL . "Имя: {$request['name']}" . PHP_EOL . "Телефон: {$request['phone']}";
//
//            $response = Http::post("https://api.telegram.org/bot{$tg_token}/sendMessage", [
//                'chat_id' => $tg_chat_id,
//                'text' => $tg_message
//            ]);
//
//            if ($response->failed()) {
//                return response()->json(['status' => 'error', 'error' => 'Failed to send Telegram message'], 500);
//            }
//
//            return response()->json(['status' => 'ok', 'tg_resp' => $response->body()]);
//        case 'roulette':
//            try {
//                Mail::to([
//                    'haval@bashauto.com',
//                    'r.gussamov@bashauto.com',
//                    'a.ismagilov@bashauto.com',
//                    'o.balyklova@bashauto.com',
//                    'el.bakirova@bashauto.com',
//                    'm.abzelilov@bashauto.com'
//                ])->send(new RouletteAppMail($request['phone'], $request['present']));
//            } catch (\Exception $e) {
//                return response()->json(['status' => 'error', 'error' => $e->getMessage()], 500);
//            }
//
//            // Send Telegram message
//            $tg_token = '6330040075:AAGc8xJeYtYIU9N2RboJ7hkxaaxJ2locIqg';
//            $tg_chat_id = '-4070476702';
//            $tg_message = "Новая заявка с подарком на сайте haval.bashauto.com (HAVAL)" . PHP_EOL .  "Телефон: {$request['phone']}" . PHP_EOL .  "Подарок: {$request['present']}";
//
//            $response = Http::post("https://api.telegram.org/bot{$tg_token}/sendMessage", [
//                'chat_id' => $tg_chat_id,
//                'text' => $tg_message
//            ]);
//
//            if ($response->failed()) {
//                return response()->json(['status' => 'error', 'error' => 'Failed to send Telegram message'], 500);
//            }
//
//            return response()->json(['status' => 'ok', 'tg_resp' => $response->body()]);
//        case 'gos':
//            try {
//                Mail::to([
//                    'haval@bashauto.com',
//                    'r.gussamov@bashauto.com',
//                    'a.ismagilov@bashauto.com',
//                    'o.balyklova@bashauto.com',
//                    'el.bakirova@bashauto.com',
//                    'm.abzelilov@bashauto.com'
//                ])->send(new GosAppMail($request['name'], $request['phone'], $request['target']));
//            } catch (\Exception $e) {
//                return response()->json(['status' => 'error', 'error' => $e->getMessage()], 500);
//            }
//
//            // Send Telegram message
//            $tg_token = '6330040075:AAGc8xJeYtYIU9N2RboJ7hkxaaxJ2locIqg';
//            $tg_chat_id = '-4070476702';
//            $tg_message = "Заявка Госпрограмма новый Jolion в лизинг на сайте haval.bashauto.com (HAVAL)" . PHP_EOL .  "Имя: {$request['name']}" . PHP_EOL .  "Телефон: {$request['phone']}" . PHP_EOL .  "Цель: {$request['target']}";
//
//            $response = Http::post("https://api.telegram.org/bot{$tg_token}/sendMessage", [
//                'chat_id' => $tg_chat_id,
//                'text' => $tg_message
//            ]);
//
//            if ($response->failed()) {
//                return response()->json(['status' => 'error', 'error' => 'Failed to send Telegram message'], 500);
//            }
//
//            return response()->json(['status' => 'ok']);
//    }
//    return response()->json(['status' => 'error', 'error' => 'Unknown error'], 500);
//});
