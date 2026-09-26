'use strict';
const { newRoom, newPlayer, cleanName, genCode } = require('./lib/game');
const { createRoom } = require('./lib/store');

function json(status, obj) { return { statusCode: status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) }; }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  let b; try { b = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Permintaan tidak valid.' }); }
  const name = cleanName(b.name);
  if (!name) return json(400, { error: 'Isi namamu dulu.' });

  for (let i = 0; i < 8; i++) {
    const code = genCode();
    const room = newRoom(code, b.quizId);
    if (!room) return json(400, { error: 'Kuis tidak ditemukan.' });
    const p = newPlayer(room, name);
    const ok = await createRoom(code, room);
    if (ok) return json(200, { code, pid: p.id, token: p.token });
  }
  return json(503, { error: 'Server sedang sibuk, coba lagi.' });
};
