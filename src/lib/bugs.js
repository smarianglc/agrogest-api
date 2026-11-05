// BUGS_ENABLED=true liga todos os bugs.
// BUGS_ENABLED=BUG-01,BUG-02 liga só os listados.
function bugAtivo(idBug) {
  const valor = String(process.env.BUGS_ENABLED || 'false').trim();
  if (valor === 'true') return true;
  return valor.split(',').map((item) => item.trim()).includes(idBug);
}

module.exports = { bugAtivo };
