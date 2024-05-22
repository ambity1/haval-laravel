<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ZayavkaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $phone;
    public $target;
    /**
     * Create a new message instance.
     */
    public function __construct($name, $phone, $target)
    {
        $this->name = $name;
        $this->phone = $phone;
        $this->target = $target;
    }

    public function build()
    {
        return $this->subject('Новая заявка на сайте haval.bashauto.com (HAVAL)')
            ->view('emails.request');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Zayavka Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.request',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
