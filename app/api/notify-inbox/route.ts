import {NextRequest, NextResponse} from 'next/server';
import {createSupabaseService} from '../../../lib/supabase/service';
import {ADMIN_MAIL} from '../../../lib/contact';
import {sendMail, mailConfigured} from '../../../lib/mail';

// M189 — telling the house that somebody wrote in.
//
// The letter band and the contact form write straight to PostgREST, with
// no server of ours in the middle, so there is nowhere to hang a send. The
// browser therefore calls this route with the id it just wrote, and this
// route reads that row back and posts it on.
//
// Being public, it takes an id and nothing else: the words in the email
// come out of the database, never out of the request, so it cannot be used
// to send mail saying whatever the caller likes. And it sends only while
// notified_at is null, stamping it as it goes — one row, one email, however
// many times anyone calls it.
//
// It never reports failure upward in a way that matters. The row is the
// record; the email is a convenience. A visitor who has been thanked has
// been heard whether or not Resend was reachable.

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {id?: string} | null;
  const id = body?.id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ok: false, reason: 'bad id'}, {status: 400});
  }

  if (!mailConfigured()) {
    return NextResponse.json({ok: false, reason: 'mail not configured'});
  }
  const supabase = createSupabaseService();
  if (!supabase) {
    return NextResponse.json({ok: false, reason: 'service key missing'});
  }

  /* Claim the row before sending. Filtering on notified_at being null and
     stamping it in one statement means two calls racing each other cannot
     both win — the second updates nothing and comes back empty. */
  const {data: claimed, error} = await supabase
    .from('inbox')
    .update({notified_at: new Date().toISOString()})
    .eq('id', id)
    .is('notified_at', null)
    .select('kind, email, name, message, locale, created_at')
    .maybeSingle();

  if (error) return NextResponse.json({ok: false, reason: 'lookup failed'});
  if (!claimed) return NextResponse.json({ok: true, already: true});

  const row = claimed as {
    kind: string;
    email: string;
    name: string | null;
    message: string | null;
    locale: string | null;
    created_at: string;
  };

  const isLetter = row.kind === 'letter';
  const subject = isLetter
    ? `[Awesome Books] 뉴스레터 신청 — ${row.email}`
    : `[Awesome Books] 문의 — ${row.name || row.email}`;

  const lines = [
    isLetter ? '어썸 북스 뉴스레터 신청이 들어왔습니다.' : '문의가 들어왔습니다.',
    '',
    `보낸 사람 : ${row.name || '(이름 없음)'}`,
    `이메일    : ${row.email}`,
    `언어      : ${row.locale ?? '-'}`,
    `받은 시각 : ${row.created_at}`,
    ...(row.message ? ['', '내용', '─────', row.message] : []),
    '',
    '─────',
    '관리자 받은 편지함: https://www.awesomebooks.asia/ko/admin/inbox',
    '이 메일에 그대로 답장하면 보낸 사람에게 전달됩니다.'
  ];

  const sent = await sendMail({
    to: ADMIN_MAIL,
    subject,
    text: lines.join('\n'),
    replyTo: row.email
  });

  /* Put the row back in the queue if the send failed, so a later attempt
     — another submission's call, or a hand-run retry — can pick it up
     rather than the message being silently marked as told. */
  if (!sent.ok) {
    await supabase.from('inbox').update({notified_at: null}).eq('id', id);
  }

  return NextResponse.json(sent);
}
