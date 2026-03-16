import { useState, useEffect, useCallback } from "react";
import { api } from "./api.js";

// ── Constantes ───────────────────────────────────────────────────────────────
const SETORES = [
  "Acessa SP Centro","Acessa SP Cohab","Almox Educacao","Anglicano C1","Anglicano C3",
  "Arquivo","Augusto Reis","Bordini","Cadastro Único","CAPS","CCI","Centro Cultural",
  "Conselho Tutelar","Creas","Creche Dagina","CS1","CS2","Cultura","Dona Lola","Educação",
  "Escola Dagina","Esporte","Geraldo Pascon","Gestão","Guarda Municipal","Helio da Silva",
  "Ida Inocente","Leonor","Meio Ambiente","Merenda","Milton Monti","Policlínica",
  "Posto Aparecida","Posto Raphael","Posto Santa Monica","Posto São Geraldo","Posto Vila Rica",
  "Prefeitura","Prefeitura Aparecida","Promoção Aparecida","Promoção São Geraldo","Promoção Social",
  "Saúde","Segurança do Trabalho","S.I.M","Transporte","Turismo","UAMAS",
  "Vigilância Epidemiológica/UVA","Walter Carrer","Zigomar Augusto",
];
const STATUS  = { PENDENTE: "Pendente", APROVADO: "Aprovado", RECEBIDO: "Recebido", CANCELADO: "Cancelado" };
const COR_STATUS = {
  Pendente:  "bg-yellow-100 text-yellow-800 border-yellow-300",
  Aprovado:  "bg-blue-100 text-blue-800 border-blue-300",
  Recebido:  "bg-green-100 text-green-800 border-green-300",
  Cancelado: "bg-red-100 text-red-800 border-red-300",
};

const hoje  = () => new Date().toLocaleDateString("pt-BR");
const agora = () => new Date().toLocaleString("pt-BR");
const uid   = () => Math.random().toString(36).slice(2,9).toUpperCase();

// ── Ícones ───────────────────────────────────────────────────────────────────
const PATHS = {
  dashboard: "M3 7a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm10 0a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V7zM3 17a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2z",
  stock:     "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  order:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  entry:     "M12 4v16m8-8H4",
  exit:      "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  alert:     "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  check:     "M5 13l4 4L19 7",
  trash:     "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  edit:      "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  printer:   "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z",
  history:   "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  x:         "M6 18L18 6M6 6l12 12",
  plus:      "M12 4v16m8-8H4",
  download:  "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  menu:      "M4 6h16M4 12h16M4 18h16",
  chart:     "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

const Icon = ({ name, size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none"
    viewBox="0 0 24 24" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={PATHS[name]} />
  </svg>
);

// ── Componentes base ─────────────────────────────────────────────────────────
const Badge = ({ estoque, minimo }) => {
  if (estoque === 0)          return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">Zerado</span>;
  if (estoque <= minimo)      return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">Crítico</span>;
  return                             <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300">OK</span>;
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <Icon name="x" size={18} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const bg = { success:"bg-green-600", error:"bg-red-600", info:"bg-blue-600", warning:"bg-yellow-500" };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-xl ${bg[type]||bg.info}`}>
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onClose}><Icon name="x" size={14} /></button>
    </div>
  );
};

const Input = ({ label, ...p }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" {...p} />
  </div>
);

const Select = ({ label, children, ...p }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" {...p}>
      {children}
    </select>
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════// LOGIN
// ════════════════════════════════════════════════════════════════════════════════
const Login = ({ onLogin }) => {
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [erro,    setErro]    = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const data = await api.login(form.username, form.password);
      onLogin(data.user);
    } catch (err) {
      setErro(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4">
            <Icon name="printer" size={28} className="text-white"/>
          </div>
          <h1 className="text-2xl font-black text-gray-800">Almoxarifado</h1>
          <p className="text-gray-400 text-sm mt-1">Gestão de Toners</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Usuário" type="text" value={form.username} autoComplete="username"
            onChange={e => setForm(f => ({...f, username: e.target.value}))} placeholder="admin"/>
          <Input label="Senha" type="password" value={form.password} autoComplete="current-password"
            onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••••"/>
          {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-100 transition-colors">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// TROCAR SENHA
// ════════════════════════════════════════════════════════════════════════════════
const TrocarSenha = ({ onClose, toast }) => {
  const [form,    setForm]    = useState({ senhaAtual: "", novaSenha: "", confirmar: "" });
  const [saving,  setSaving]  = useState(false);

  const salvar = async () => {
    if (form.novaSenha !== form.confirmar) { toast("As senhas não coincidem", "error"); return; }
    if (form.novaSenha.length < 6)         { toast("Nova senha mínimo 6 caracteres", "error"); return; }
    setSaving(true);
    try {
      await api.trocarSenha(form.senhaAtual, form.novaSenha);
      toast("Senha alterada com sucesso!", "success");
      onClose();
    } catch (err) {
      toast(err.message, "error");
    }
    setSaving(false);
  };

  return (
    <Modal title="Alterar Senha" onClose={onClose}>
      <div className="space-y-4">
        <Input label="Senha atual" type="password" value={form.senhaAtual}
          onChange={e => setForm(f=>({...f, senhaAtual: e.target.value}))}/>
        <Input label="Nova senha" type="password" value={form.novaSenha}
          onChange={e => setForm(f=>({...f, novaSenha: e.target.value}))}/>
        <Input label="Confirmar nova senha" type="password" value={form.confirmar}
          onChange={e => setForm(f=>({...f, confirmar: e.target.value}))}/>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancelar</button>
          <button onClick={salvar} disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:bg-gray-300">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ════════════════════════════════════════════════════════════════════════════════// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const Dashboard = ({ toners, pedidos, saidas }) => {
  const criticos         = toners.filter(t => t.estoque <= t.estoqueMinimo).length;
  const zerados          = toners.filter(t => t.estoque === 0).length;
  const pedidosPendentes = pedidos.filter(p => p.status === STATUS.PENDENTE).length;
  const saidasHoje       = saidas.filter(s => s.data === hoje()).length;
  const totalEstoque     = toners.reduce((a, t) => a + t.estoque, 0);

  const cards = [
    { label:"Total em Estoque",   value:totalEstoque,     icon:"stock",   color:"from-blue-500 to-blue-600",    sub:"unidades" },
    { label:"Toners Críticos",    value:criticos,         icon:"alert",   color:"from-orange-500 to-orange-600",sub:"abaixo do mínimo" },
    { label:"Toners Zerados",     value:zerados,          icon:"alert",   color:"from-red-500 to-red-600",      sub:"sem estoque" },
    { label:"Pedidos Pendentes",  value:pedidosPendentes, icon:"order",   color:"from-yellow-500 to-yellow-600",sub:"aguardando" },
    { label:"Saídas Hoje",        value:saidasHoje,       icon:"exit",    color:"from-purple-500 to-purple-600",sub:"registros" },
  ];

  const criticosList = toners.filter(t => t.estoque <= t.estoqueMinimo).sort((a,b) => a.estoque - b.estoque);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do almoxarifado · {hoje()}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c,i) => (
          <div key={i} className={`bg-gradient-to-br ${c.color} rounded-2xl p-4 text-white shadow-lg`}>
            <Icon name={c.icon} size={22} className="opacity-80 mb-2" />
            <div className="text-3xl font-black">{c.value}</div>
            <div className="text-xs font-semibold opacity-90 mt-0.5">{c.label}</div>
            <div className="text-xs opacity-70">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Icon name="alert" size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-800">Atenção Necessária</h2>
          </div>
          {criticosList.length === 0
            ? <div className="p-6 text-center text-gray-400 text-sm">Todos os toners estão com estoque adequado ✓</div>
            : <div className="divide-y divide-gray-50">
                {criticosList.map(t => (
                  <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{t.modelo}</div>
                      <div className="text-xs text-gray-400">{t.impressora}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-700">{t.estoque} <span className="text-xs font-normal text-gray-400">/ mín {t.estoqueMinimo}</span></div>
                      <Badge estoque={t.estoque} minimo={t.estoqueMinimo} />
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Icon name="history" size={18} className="text-purple-500" />
            <h2 className="font-bold text-gray-800">Últimas Saídas</h2>
          </div>
          {saidas.length === 0
            ? <div className="p-6 text-center text-gray-400 text-sm">Nenhuma saída registrada ainda</div>
            : <div className="divide-y divide-gray-50">
                {[...saidas].reverse().slice(0,6).map(s => (
                  <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{s.tonerModelo}</div>
                      <div className="text-xs text-gray-400">{s.setor}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-700">-{s.quantidade}</div>
                      <div className="text-xs text-gray-400">{s.data}</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ESTOQUE
// ══════════════════════════════════════════════════════════════════════════════
const Estoque = ({ toners, setToners, toast }) => {
  const [busca,     setBusca]     = useState("");
  const [filtro,    setFiltro]    = useState("todos");
  const [modal,     setModal]     = useState(null); // null | "novo" | toner
  const [confirmarExclusao, setConfirmarExclusao] = useState(null); // null | toner
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ modelo:"", impressora:"", cor:"Preto", estoque:"", estoqueMinimo:"", preco:"" });
  const [pagina,    setPagina]    = useState(1);
  const POR_PAGINA = 10;

  const filtrados = toners.filter(t => {
    const ok = t.modelo.toLowerCase().includes(busca.toLowerCase()) || t.impressora.toLowerCase().includes(busca.toLowerCase());
    if (filtro === "criticos") return ok && t.estoque <= t.estoqueMinimo && t.estoque > 0;
    if (filtro === "zerados")  return ok && t.estoque === 0;
    return ok;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginados    = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const mudarBusca  = v => { setBusca(v);  setPagina(1); };
  const mudarFiltro = v => { setFiltro(v); setPagina(1); };

  const abrirNovo  = () => { setForm({ modelo:"", impressora:"", cor:"Preto", estoque:"", estoqueMinimo:"", preco:"" }); setModal("novo"); };
  const abrirEdit  = t  => { setForm({ modelo:t.modelo, impressora:t.impressora, cor:t.cor, estoque:t.estoque, estoqueMinimo:t.estoqueMinimo, preco:t.preco }); setModal(t); };

  const salvar = async () => {
    if (!form.modelo || !form.impressora || form.estoque === "" || form.estoqueMinimo === "") {
      toast("Preencha todos os campos obrigatórios", "error"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, estoque:+form.estoque, estoqueMinimo:+form.estoqueMinimo, preco:+form.preco };
      if (modal === "novo") {
        const novo = await api.createToner(payload);
        setToners(p => [...p, novo]);
        toast("Toner cadastrado com sucesso!", "success");
      } else {
        await api.updateToner(modal.id, payload);
        setToners(p => p.map(t => t.id === modal.id ? { ...t, ...payload } : t));
        toast("Toner atualizado!", "success");
      }
      setModal(null);
    } catch { toast("Erro ao salvar toner", "error"); }
    setSaving(false);
  };

  const excluir = async () => {
    const id = confirmarExclusao.id;
    try {
      await api.deleteToner(id);
      setToners(p => p.filter(t => t.id !== id));
      toast("Toner removido", "info");
    } catch { toast("Erro ao remover", "error"); }
    setConfirmarExclusao(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estoque de Toners</h1>
          <p className="text-gray-500 text-sm">{toners.length} modelos cadastrados</p>
        </div>
        <button onClick={abrirNovo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200">
          <Icon name="plus" size={16} /> Novo Toner
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input value={busca} onChange={e => mudarBusca(e.target.value)} placeholder="Buscar modelo ou impressora..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
        <div className="flex gap-2">
          {[["todos","Todos"],["criticos","Críticos"],["zerados","Zerados"]].map(([v,l]) => (
            <button key={v} onClick={() => mudarFiltro(v)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${filtro===v?"bg-blue-600 text-white":"bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Modelo / Impressora</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Estoque</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Mín.</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.length === 0
                ? <tr><td colSpan={5} className="text-center py-10 text-gray-400">Nenhum toner encontrado</td></tr>
                : paginados.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800">{t.modelo}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Icon name="printer" size={11}/>{t.impressora}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-lg font-black ${t.estoque===0?"text-red-600":t.estoque<=t.estoqueMinimo?"text-orange-600":"text-green-600"}`}>{t.estoque}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-500 font-medium">{t.estoqueMinimo}</td>
                    <td className="px-4 py-3.5 text-center"><Badge estoque={t.estoque} minimo={t.estoqueMinimo} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => abrirEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Icon name="edit" size={15}/></button>
                        <button onClick={() => setConfirmarExclusao(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Icon name="trash" size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal confirmação exclusão */}
      {confirmarExclusao && (
        <Modal title="Excluir Toner" onClose={() => setConfirmarExclusao(null)}>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="alert" size={18} className="text-red-500 shrink-0"/>
                <span className="font-semibold">Esta ação não pode ser desfeita.</span>
              </div>
              <div>Você está prestes a excluir o toner <strong>{confirmarExclusao.modelo}</strong>.</div>
              {confirmarExclusao.estoque > 0 && (
                <div className="mt-2 text-red-600 font-medium">⚠️ Este toner ainda possui <strong>{confirmarExclusao.estoque}</strong> unidade(s) em estoque.</div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExclusao(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={excluir}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">Sim, excluir</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Exibindo {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtrados.length)} de {filtrados.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">← Anterior</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPagina(n)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  n === pagina ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}>{n}</button>
            ))}
            <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Próxima →</button>
          </div>
        </div>
      )}

      {modal && (
        <Modal title={modal==="novo"?"Novo Toner":"Editar Toner"} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Input label="Modelo *" value={form.modelo} onChange={e => setForm(f=>({...f,modelo:e.target.value}))} placeholder="ex: HP 85A (CE285A)" />
            <Input label="Impressora *" value={form.impressora} onChange={e => setForm(f=>({...f,impressora:e.target.value}))} placeholder="ex: HP LaserJet P1102" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Estoque *" type="number" min="0" value={form.estoque} onChange={e => setForm(f=>({...f,estoque:e.target.value}))} />
              <Input label="Mínimo *"  type="number" min="0" value={form.estoqueMinimo} onChange={e => setForm(f=>({...f,estoqueMinimo:e.target.value}))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PEDIDOS
// ══════════════════════════════════════════════════════════════════════════════
const Pedidos = ({ toners, pedidos, setPedidos, toast }) => {
  const [aba,         setAba]         = useState("gerar");
  const [selecionados,setSelecionados]= useState([]);
  const [qtds,        setQtds]        = useState({});
  const [modalConf,   setModalConf]   = useState(null);
  const [saving,      setSaving]      = useState(false);

  const criticos = toners.filter(t => t.estoque <= t.estoqueMinimo);

  const toggleSel = id => {
    setSelecionados(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
    if (!qtds[id]) {
      const t = toners.find(x=>x.id===id);
      setQtds(q => ({...q,[id]: Math.max(1, t.estoqueMinimo*2 - t.estoque)}));
    }
  };

  const gerarPDF = (pedido) => {
    const win = window.open("", "_blank");
    const linhas = pedido.itens.map(it => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${it.modelo}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280">${it.impressora}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:bold">${it.quantidade}</td>
      </tr>`).join("");
    win.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Pedido ${pedido.codigo}</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#111}h1{font-size:20px;margin-bottom:4px}p{margin:2px 0;color:#555;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:24px}th{background:#f3f4f6;text-align:left;padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #d1d5db}td{font-size:13px}@media print{button{display:none}}</style></head><body><h1>Pedido de Compra</h1><p>Código: <strong>${pedido.codigo}</strong></p><p>Data: ${pedido.dataCriacao}</p><p>Status: ${pedido.status}</p><table><thead><tr><th>Modelo</th><th>Impressora</th><th style="text-align:center">Quantidade</th></tr></thead><tbody>${linhas}</tbody></table><br><button onclick="window.print()" style="margin-top:20px;padding:8px 20px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">Imprimir / Salvar PDF</button></body></html>`);
    win.document.close();
  };

  const gerarPedido = async () => {
    if (!selecionados.length) { toast("Selecione ao menos um item","error"); return; }
    setSaving(true);
    try {
      const itens = selecionados.map(id => {
        const t = toners.find(x=>x.id===id);
        return { tonerId:id, modelo:t.modelo, impressora:t.impressora, quantidade:+(qtds[id]||1) };
      });
      const pedido = { id:uid(), codigo:`PED-${uid()}`, data:hoje(), dataCriacao:agora(), itens, total:0, status:STATUS.PENDENTE };
      const novo = await api.createPedido(pedido);
      setPedidos(p => [...p, novo]);
      setSelecionados([]); setQtds({});
      toast(`Pedido ${novo.codigo} gerado!`, "success");
      gerarPDF(novo);
      setAba("lista");
    } catch { toast("Erro ao gerar pedido","error"); }
    setSaving(false);
  };

  const alterarStatus = async (id, status) => {
    try {
      await api.updatePedido(id, { status });
      setPedidos(p => p.map(x => x.id===id ? {...x,status} : x));
      toast(`Status: ${status}`, "success");
    } catch { toast("Erro ao atualizar status","error"); }
    setModalConf(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pedidos de Compra</h1>
        <p className="text-gray-500 text-sm">{criticos.length} toner(s) abaixo do mínimo</p>
      </div>
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {[["gerar","Gerar Pedido"],["lista","Histórico"]].map(([v,l]) => (
          <button key={v} onClick={() => setAba(v)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${aba===v?"bg-white text-blue-700 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>{l}</button>
        ))}
      </div>

      {aba==="gerar" && (
        <div className="space-y-4">
          {criticos.length === 0
            ? <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <Icon name="check" size={36} className="text-green-500 mx-auto mb-3"/>
                <p className="text-green-800 font-semibold">Estoque em dia!</p>
                <p className="text-green-600 text-sm mt-1">Todos os toners estão acima do mínimo.</p>
              </div>
            : <>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <Icon name="alert" size={20} className="text-orange-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-orange-800 text-sm"><strong>{criticos.length} toner(s)</strong> precisam de reposição. Selecione e defina as quantidades.</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-5 py-3.5 w-10">
                            <input type="checkbox"
                              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                              checked={criticos.length > 0 && selecionados.length === criticos.length}
                              onChange={() => {
                                if (selecionados.length === criticos.length) {
                                  setSelecionados([]);
                                } else {
                                  setSelecionados(criticos.map(t => t.id));
                                  setQtds(q => {
                                    const novo = { ...q };
                                    criticos.forEach(t => {
                                      if (!novo[t.id]) novo[t.id] = Math.max(1, t.estoqueMinimo * 2 - t.estoque);
                                    });
                                    return novo;
                                  });
                                }
                              }}
                            />
                          </th>
                          <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Modelo</th>
                          <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Atual</th>
                          <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Mín.</th>
                          <th className="text-center px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase">Qtd. Pedido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {criticos.map(t => (
                          <tr key={t.id} className={selecionados.includes(t.id)?"bg-blue-50":"hover:bg-gray-50"}>
                            <td className="px-5 py-3.5">
                              <input type="checkbox" checked={selecionados.includes(t.id)} onChange={() => toggleSel(t.id)}
                                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"/>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-gray-800">{t.modelo}</div>
                              <div className="text-xs text-gray-400">{t.impressora}</div>
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-orange-600">{t.estoque}</td>
                            <td className="px-4 py-3.5 text-center text-gray-500">{t.estoqueMinimo}</td>
                            <td className="px-4 py-3.5">
                              <input type="number" min="1" value={qtds[t.id]||""} disabled={!selecionados.includes(t.id)}
                                onChange={e => setQtds(q=>({...q,[t.id]:e.target.value}))}
                                className="w-20 mx-auto block px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400"/>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={gerarPedido} disabled={!selecionados.length||saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200">
                    <Icon name="download" size={16}/> {saving?"Gerando...":"Gerar Pedido"}
                  </button>
                </div>
              </>
          }
        </div>
      )}

      {aba==="lista" && (
        <div className="space-y-4">
          {pedidos.length === 0
            ? <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100 shadow-sm">
                <Icon name="order" size={40} className="mx-auto mb-3 opacity-30"/>
                <p>Nenhum pedido gerado ainda</p>
              </div>
            : [...pedidos].reverse().map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                      {p.codigo}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${COR_STATUS[p.status]}`}>{p.status}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.dataCriacao}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status===STATUS.PENDENTE && <>
                      <button onClick={() => alterarStatus(p.id,STATUS.APROVADO)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">Aprovar</button>
                      <button onClick={() => alterarStatus(p.id,STATUS.CANCELADO)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200">Cancelar</button>
                    </>}
                    {p.status===STATUS.APROVADO &&
                      <button onClick={() => setModalConf(p)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700">Registrar Recebimento</button>
                    }
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {p.itens.map((it,i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-700 text-sm">{it.modelo}</span>
                        <span className="text-xs text-gray-400 ml-2">{it.impressora}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{it.quantidade}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {modalConf && (
        <Modal title="Confirmar Recebimento" onClose={() => setModalConf(null)}>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">Confirme o recebimento do pedido <strong>{modalConf.codigo}</strong>.</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {modalConf.itens.map((it,i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{it.modelo}</span>
                  <span className="font-semibold text-green-700">+{it.quantidade}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalConf(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={() => alterarStatus(modalConf.id, STATUS.RECEBIDO)} className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold">Confirmar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ENTRADA
// ══════════════════════════════════════════════════════════════════════════════
const Entrada = ({ toners, setToners, entradas, setEntradas, toast }) => {
  const [form,    setForm]    = useState({ tonerId:"", quantidade:1, fornecedor:"", nf:"", obs:"" });
  const [confirmar,setConf]   = useState(false);
  const [saving,  setSaving]  = useState(false);

  const tonerSel = toners.find(t => t.id === +form.tonerId);

  const registrar = async () => {
    setSaving(true);
    try {
      const e = { id:uid(), data:hoje(), dataHora:agora(), tonerId:+form.tonerId,
        tonerModelo:tonerSel.modelo, quantidade:+form.quantidade,
        fornecedor:form.fornecedor, nf:form.nf, obs:form.obs };
      const nova = await api.createEntrada(e);
      setEntradas(p => [...p, nova]);
      setToners(prev => prev.map(t => t.id===+form.tonerId ? {...t, estoque:t.estoque + +form.quantidade} : t));
      setForm({ tonerId:"", quantidade:1, fornecedor:"", nf:"", obs:"" });
      setConf(false);
      toast(`+${e.quantidade} "${e.tonerModelo}" adicionados ao estoque!`, "success");
    } catch { toast("Erro ao registrar entrada","error"); }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Entrada de Toners</h1>
        <p className="text-gray-500 text-sm">Registre o recebimento de toners no almoxarifado</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Icon name="entry" size={18} className="text-green-600"/>Novo Registro</h2>
          <Select label="Toner *" value={form.tonerId} onChange={e => setForm(f=>({...f,tonerId:e.target.value}))}>
            <option value="">Selecione o toner...</option>
            {toners.map(t => <option key={t.id} value={t.id}>{t.modelo} — {t.impressora} (estoque: {t.estoque})</option>)}
          </Select>
          {tonerSel && (
            <div className="bg-green-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-green-800">{tonerSel.modelo}</div>
                <div className="text-xs text-green-600">{tonerSel.impressora}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-600">Estoque atual</div>
                <div className="text-xl font-black text-green-700">{tonerSel.estoque}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantidade *" type="number" min="1" value={form.quantidade} onChange={e => setForm(f=>({...f,quantidade:e.target.value}))}/>
            <Input label="Nota Fiscal"  value={form.nf} onChange={e => setForm(f=>({...f,nf:e.target.value}))} placeholder="Nº da NF"/>
          </div>
          <Input label="Fornecedor" value={form.fornecedor} onChange={e => setForm(f=>({...f,fornecedor:e.target.value}))} placeholder="Nome do fornecedor"/>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={form.obs} onChange={e => setForm(f=>({...f,obs:e.target.value}))} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"/>
          </div>
          <button onClick={() => { if (!form.tonerId||!form.quantidade) { toast("Preencha os campos","error"); return; } setConf(true); }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-green-200 flex items-center justify-center gap-2">
            <Icon name="entry" size={16}/> Registrar Entrada
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Icon name="history" size={18} className="text-green-600"/>
            <h2 className="font-bold text-gray-800">Histórico de Entradas</h2>
          </div>
          {entradas.length === 0
            ? <div className="p-10 text-center text-gray-400 text-sm"><Icon name="entry" size={36} className="mx-auto mb-3 opacity-25"/>Nenhuma entrada registrada</div>
            : <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {[...entradas].reverse().map(e => (
                  <div key={e.id} className="px-5 py-3.5 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{e.tonerModelo}</div>
                      {e.fornecedor && <div className="text-xs text-gray-400">{e.fornecedor}{e.nf?` · NF ${e.nf}`:""}</div>}
                      <div className="text-xs text-gray-400 mt-0.5">{e.dataHora}</div>
                    </div>
                    <span className="font-black text-green-700 text-lg ml-3">+{e.quantidade}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
      {confirmar && (
        <Modal title="Confirmar Entrada" onClose={() => setConf(false)}>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800 space-y-1">
              <div className="flex justify-between"><span>Toner:</span><strong>{tonerSel?.modelo}</strong></div>
              <div className="flex justify-between"><span>Quantidade:</span><strong>+{form.quantidade} unidades</strong></div>
              <div className="flex justify-between"><span>Novo estoque:</span><strong>{(tonerSel?.estoque||0)+ +form.quantidade}</strong></div>
              {form.fornecedor && <div className="flex justify-between"><span>Fornecedor:</span><strong>{form.fornecedor}</strong></div>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConf(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={registrar} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold">
                {saving?"Salvando...":"Confirmar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SAÍDA
// ══════════════════════════════════════════════════════════════════════════════
const Saida = ({ toners, setToners, saidas, setSaidas, toast }) => {
  const [form,    setForm]   = useState({ tonerId:"", setor:"", quantidade:1, responsavel:"", obs:"" });
  const [confirmar,setConf]  = useState(false);
  const [filtroSetor,setFS]  = useState("");
  const [saving,  setSaving] = useState(false);

  const tonerSel = toners.find(t => t.id === +form.tonerId);
  const saidasFilt = saidas.filter(s => !filtroSetor || s.setor === filtroSetor);
  const setoresUsados = [...new Set(saidas.map(s => s.setor))];

  const registrar = async () => {
    if (+form.quantidade > (tonerSel?.estoque||0)) { toast("Quantidade maior que o estoque!","error"); return; }
    setSaving(true);
    try {
      const s = { id:uid(), data:hoje(), dataHora:agora(), tonerId:+form.tonerId,
        tonerModelo:tonerSel.modelo, setor:form.setor, quantidade:+form.quantidade,
        responsavel:form.responsavel, obs:form.obs };
      const nova = await api.createSaida(s);
      setSaidas(p => [...p, nova]);
      setToners(prev => prev.map(t => t.id===+form.tonerId ? {...t, estoque:t.estoque - +form.quantidade} : t));
      setForm({ tonerId:"", setor:"", quantidade:1, responsavel:"", obs:"" });
      setConf(false);
      toast(`Saída de ${s.quantidade}x "${s.tonerModelo}" para ${s.setor}!`, "success");
    } catch (err) {
      toast(err.message||"Erro ao registrar saída","error");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Saída por Setor</h1>
        <p className="text-gray-500 text-sm">Registre a entrega de toners para cada setor</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Icon name="exit" size={18} className="text-purple-600"/>Registrar Saída</h2>
          <Select label="Toner *" value={form.tonerId} onChange={e => setForm(f=>({...f,tonerId:e.target.value}))}>
            <option value="">Selecione o toner...</option>
            {toners.filter(t=>t.estoque>0).map(t => <option key={t.id} value={t.id}>{t.modelo} — {t.impressora} (estoque: {t.estoque})</option>)}
            {toners.filter(t=>t.estoque===0).length>0 && (
              <optgroup label="Sem estoque">
                {toners.filter(t=>t.estoque===0).map(t => <option key={t.id} value={t.id} disabled>{t.modelo} — SEM ESTOQUE</option>)}
              </optgroup>
            )}
          </Select>
          {tonerSel && (
            <div className={`rounded-xl p-3 flex items-center justify-between ${tonerSel.estoque===0?"bg-red-50":"bg-purple-50"}`}>
              <div>
                <div className={`text-sm font-semibold ${tonerSel.estoque===0?"text-red-800":"text-purple-800"}`}>{tonerSel.modelo}</div>
                <div className={`text-xs ${tonerSel.estoque===0?"text-red-600":"text-purple-600"}`}>{tonerSel.impressora}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${tonerSel.estoque===0?"text-red-600":"text-purple-600"}`}>Disponível</div>
                <div className={`text-xl font-black ${tonerSel.estoque===0?"text-red-700":"text-purple-700"}`}>{tonerSel.estoque}</div>
              </div>
            </div>
          )}
          <Select label="Setor *" value={form.setor} onChange={e => setForm(f=>({...f,setor:e.target.value}))}>
            <option value="">Selecione o setor...</option>
            {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantidade *" type="number" min="1" max={tonerSel?.estoque||999}
              value={form.quantidade} onChange={e => setForm(f=>({...f,quantidade:e.target.value}))}/>
            <Input label="Responsável" value={form.responsavel} onChange={e => setForm(f=>({...f,responsavel:e.target.value}))} placeholder="Nome"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={form.obs} onChange={e => setForm(f=>({...f,obs:e.target.value}))} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"/>
          </div>
          <button onClick={() => { if (!form.tonerId||!form.setor||!form.quantidade) { toast("Preencha os campos","error"); return; } setConf(true); }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
            <Icon name="exit" size={16}/> Registrar Saída
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="history" size={18} className="text-purple-600"/>
              <h2 className="font-bold text-gray-800">Histórico de Saídas</h2>
            </div>
            <select value={filtroSetor} onChange={e => setFS(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
              <option value="">Todos os setores</option>
              {setoresUsados.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {saidasFilt.length === 0
            ? <div className="p-10 text-center text-gray-400 text-sm"><Icon name="exit" size={36} className="mx-auto mb-3 opacity-25"/>Nenhuma saída registrada</div>
            : <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {[...saidasFilt].reverse().map(s => (
                  <div key={s.id} className="px-5 py-3.5 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{s.tonerModelo}</div>
                      <div className="text-xs text-purple-600 font-medium">{s.setor}</div>
                      {s.responsavel && <div className="text-xs text-gray-400">{s.responsavel}</div>}
                      <div className="text-xs text-gray-400">{s.dataHora}</div>
                    </div>
                    <span className="font-black text-purple-700 text-lg ml-3">-{s.quantidade}</span>
                  </div>
                ))}
              </div>
          }

        </div>
      </div>
      {confirmar && (
        <Modal title="Confirmar Saída" onClose={() => setConf(false)}>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-800 space-y-1">
              <div className="flex justify-between"><span>Toner:</span><strong>{tonerSel?.modelo}</strong></div>
              <div className="flex justify-between"><span>Setor:</span><strong>{form.setor}</strong></div>
              <div className="flex justify-between"><span>Quantidade:</span><strong>{form.quantidade}</strong></div>
              <div className="flex justify-between"><span>Estoque restante:</span><strong>{(tonerSel?.estoque||0) - +form.quantidade}</strong></div>
              {form.responsavel && <div className="flex justify-between"><span>Responsável:</span><strong>{form.responsavel}</strong></div>}
            </div>
            {(tonerSel?.estoque||0) - +form.quantidade <= tonerSel?.estoqueMinimo && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700 flex items-center gap-2">
                <Icon name="alert" size={14}/> Após esta saída o estoque ficará abaixo do mínimo.
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setConf(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={registrar} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold">
                {saving?"Salvando...":"Confirmar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// RELATÓRIOS
// ══════════════════════════════════════════════════════════════════════════════
const CORES_GRAFICO = [
  "bg-blue-500","bg-purple-500","bg-green-500","bg-orange-500","bg-red-500",
  "bg-teal-500","bg-pink-500","bg-yellow-500","bg-indigo-500","bg-cyan-500",
];

const Relatorios = ({ saidas, entradas }) => {
  const [periodo, setPeriodo] = useState("tudo");
  const [topN,    setTopN]    = useState(10);

  const filtrar = (lista) => {
    if (periodo === "tudo") return lista;
    const agora = new Date();
    return lista.filter(item => {
      const d = new Date(item.data);
      if (isNaN(d)) return false;
      if (periodo === "mes")  return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
      if (periodo === "ano")  return d.getFullYear() === agora.getFullYear();
      if (periodo === "90d")  return (agora - d) <= 90 * 864e5;
      return true;
    });
  };

  const saidasFilt   = filtrar(saidas);
  const entradasFilt = filtrar(entradas);

  // Consumo por setor
  const porSetor = Object.entries(
    saidasFilt.reduce((acc, s) => {
      const setor = (s.setor || "Sem setor").trim();
      acc[setor] = (acc[setor] || 0) + s.quantidade;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  // Toners que mais saem
  const porToner = Object.entries(
    saidasFilt.reduce((acc, s) => {
      const modelo = (s.tonerModelo || "?").trim();
      acc[modelo] = (acc[modelo] || 0) + s.quantidade;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, topN);

  // Toners que mais entram
  const porTonerEntrada = Object.entries(
    entradasFilt.reduce((acc, e) => {
      const modelo = (e.tonerModelo || "?").trim();
      acc[modelo] = (acc[modelo] || 0) + e.quantidade;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, topN);

  const maxSetor  = porSetor[0]?.[1]  || 1;
  const maxToner  = porToner[0]?.[1]  || 1;
  const maxEntrada= porTonerEntrada[0]?.[1] || 1;

  const totalSaidas   = saidasFilt.reduce((a, s) => a + s.quantidade, 0);
  const totalEntradas = entradasFilt.reduce((a, e) => a + e.quantidade, 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
          <p className="text-gray-500 text-sm">{saidasFilt.length} saídas · {entradasFilt.length} entradas no período</p>
        </div>
        <select value={periodo} onChange={e => setPeriodo(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="tudo">Todo o período</option>
          <option value="ano">Este ano</option>
          <option value="90d">Últimos 90 dias</option>
          <option value="mes">Este mês</option>
        </select>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:"Total de Saídas",   value:totalSaidas,          color:"text-purple-600", bg:"bg-purple-50" },
          { label:"Total de Entradas",  value:totalEntradas,         color:"text-blue-600",   bg:"bg-blue-50"   },
          { label:"Setores Atendidos",  value:porSetor.length,       color:"text-green-600",  bg:"bg-green-50"  },
          { label:"Modelos em Saída",   value:Object.keys(saidasFilt.reduce((a,s)=>{a[s.tonerModelo]=1;return a},{})).length, color:"text-orange-600", bg:"bg-orange-50" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-4`}>
            <div className={`text-2xl font-black ${c.color}`}>{c.value}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Consumo por Setor */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="exit" size={18} className="text-purple-600"/>
            <h2 className="font-bold text-gray-800">Consumo por Setor</h2>
          </div>
          <span className="text-xs text-gray-400">{porSetor.length} setores</span>
        </div>
        {porSetor.length === 0
          ? <p className="text-sm text-gray-400 text-center py-8">Sem dados no período</p>
          : <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {porSetor.map(([setor, total], i) => (
                <div key={setor} className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-4 text-right">{i+1}.</div>
                  <div className="text-sm text-gray-700 w-40 truncate shrink-0" title={setor}>{setor}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className={`${CORES_GRAFICO[i % CORES_GRAFICO.length]} h-3 rounded-full transition-all`}
                      style={{width:`${(total/maxSetor)*100}%`}}></div>
                  </div>
                  <div className="text-sm font-bold text-gray-700 w-8 text-right shrink-0">{total}</div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Toners que mais saem + Toners que mais entram */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mais saem */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="chart" size={18} className="text-rose-500"/>
              <h2 className="font-bold text-gray-800">Toners que mais saem</h2>
            </div>
            <select value={topN} onChange={e => setTopN(+e.target.value)}
              className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white focus:outline-none">
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
          {porToner.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">Sem dados no período</p>
            : <div className="space-y-3">
                {porToner.map(([modelo, total], i) => (
                  <div key={modelo} className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-4 text-right">{i+1}.</div>
                    <div className="text-sm font-medium text-gray-700 w-24 truncate shrink-0" title={modelo}>{modelo}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div className="bg-rose-500 h-3 rounded-full transition-all"
                        style={{width:`${(total/maxToner)*100}%`}}></div>
                    </div>
                    <div className="text-sm font-bold text-rose-600 w-8 text-right shrink-0">{total}</div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Mais entram */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="chart" size={18} className="text-blue-500"/>
              <h2 className="font-bold text-gray-800">Toners que mais entram</h2>
            </div>
          </div>
          {porTonerEntrada.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">Sem dados no período</p>
            : <div className="space-y-3">
                {porTonerEntrada.map(([modelo, total], i) => (
                  <div key={modelo} className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-4 text-right">{i+1}.</div>
                    <div className="text-sm font-medium text-gray-700 w-24 truncate shrink-0" title={modelo}>{modelo}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{width:`${(total/maxEntrada)*100}%`}}></div>
                    </div>
                    <div className="text-sm font-bold text-blue-600 w-8 text-right shrink-0">{total}</div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
};

// APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

// Componentes para as telas não implementadas
function Historico() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getHistorico().then(setDados).catch(() => setDados([])).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner/>;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Movimentações</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {dados?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum registro de histórico encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Data/Hora</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Toner</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Quantidade</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Setor/Fornecedor</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dados.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{item.dataHora || item.timestamp}</td>
                    <td className="px-4 py-3">
                      {item.setor ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Saída</span> : <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Entrada</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{item.tonerModelo}</td>
                    <td className="px-4 py-3 text-gray-600">{item.setor ? `-${item.quantidade}` : `+${item.quantidade}`}</td>
                    <td className="px-4 py-3 text-gray-600">{item.setor || item.fornecedor || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.responsavel || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Usuarios({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ username: "", password: "", nome: "", role: "operador" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { carregarUsers(); }, []);

  const carregarUsers = async () => {
    setLoading(true);
    try {
      const u = await api.getUsers();
      setUsers(u);
    } catch (err) {
      setUsers([]);
    }
    setLoading(false);
  };

  const criarUsuario = async () => {
    if (!form.username || !form.password || !form.nome || !form.role) {
      toast("Preencha todos os campos", "error");
      return;
    }
    if (form.password.length < 6) {
      toast("Senha deve ter pelo menos 6 caracteres", "error");
      return;
    }
    setSaving(true);
    try {
      await api.createUser(form);
      toast("Usuário criado com sucesso!", "success");
      setForm({ username: "", password: "", nome: "", role: "operador" });
      carregarUsers();
    } catch (err) {
      toast(err.message, "error");
    }
    setSaving(false);
  };

  const excluirUsuario = async (user) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.nome}" (${user.username})? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.deleteUser(user.id);
      toast("Usuário excluído com sucesso!", "success");
      carregarUsers();
    } catch (err) {
      toast(err.message, "error");
    }
  };

  if (loading) return <Spinner/>;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Usuários</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Icon name="plus" size={18} className="text-blue-600"/>Novo Usuário</h2>
          <Input label="Nome completo *" value={form.nome} onChange={e => setForm(f => ({...f, nome: e.target.value}))} placeholder="Nome do usuário"/>
          <Input label="Usuário *" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} placeholder="Nome de usuário"/>
          <Input label="Senha *" type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••••"/>
          <Select label="Função *" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
          </Select>
          <button onClick={criarUsuario} disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            <Icon name="plus" size={16}/> {saving ? "Criando..." : "Criar Usuário"}
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Icon name="printer" size={18} className="text-blue-600"/>
            <h2 className="font-bold text-gray-800">Usuários Cadastrados</h2>
          </div>
          {users.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm"><Icon name="printer" size={36} className="mx-auto mb-3 opacity-25"/>Nenhum usuário cadastrado</div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Usuário</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Função</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800 font-medium">{user.nome}</td>
                      <td className="px-4 py-3 text-gray-600">{user.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => excluirUsuario(user)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                          <Icon name="trash" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.getAudit().then(setLogs).catch(() => setLogs([])).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner/>;
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Auditoria</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {logs?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum log de auditoria encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Data/Hora</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Usuário</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Ação</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{log.username}</td>
                    <td className="px-4 py-3 text-gray-600">{log.action}</td>
                    <td className="px-4 py-3 text-gray-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tela,      setTela]      = useState("dashboard");
  const [toners,    setToners]    = useState([]);
  const [pedidos,   setPedidos]   = useState([]);
  const [saidas,    setSaidas]    = useState([]);
  const [entradas,  setEntradas]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toastMsg,  setToastMsg]  = useState(null);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [modalSenha,setModalSenha]= useState(false);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  const toast = (msg, type="info") => setToastMsg({ msg, type });

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setToners([]); setPedidos([]); setEntradas([]); setSaidas([]);
  };

  useEffect(() => {
    const onLogout = () => handleLogout();
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p, e, s] = await Promise.all([api.getToners(), api.getPedidos(), api.getEntradas(), api.getSaidas()]);
      setToners(t); setPedidos(p); setEntradas(e); setSaidas(s);
    } catch {
      toast("Erro ao conectar com o servidor. Verifique se o backend está rodando.", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (user) carregarDados(); }, [user, carregarDados]);

  if (!user) return <Login onLogin={handleLogin}/>;

  const alertasCriticos = toners.filter(t => t.estoque <= t.estoqueMinimo).length;

  // Exemplo: menu para admin
  const isAdmin = user?.role === "admin";
  const nav = [
    { id:"dashboard",  label:"Dashboard",      icon:"dashboard" },
    { id:"estoque",    label:"Estoque",         icon:"stock"     },
    { id:"pedidos",    label:"Pedidos",         icon:"order"     },
    { id:"entradas",   label:"Entradas",        icon:"entry"     },
    { id:"saidas",     label:"Saídas",          icon:"exit"      },
    { id:"historico",  label:"Histórico",       icon:"history"   },
    { id:"relatorios", label:"Relatórios",      icon:"chart"     },
    ...(isAdmin ? [
      { id:"usuarios",   label:"Usuários",        icon:"printer"   },
      { id:"audit",      label:"Auditoria",       icon:"alert"     },
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 shadow-sm fixed top-0 left-0 h-screen z-30">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Icon name="printer" size={18} className="text-white"/>
            </div>
            <div>
              <div className="font-black text-gray-800 text-sm leading-tight">Almoxarifado</div>
              <div className="text-xs text-gray-400 leading-tight">Gestão de Toners</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(item => (
            <button key={item.id} onClick={() => setTela(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${tela===item.id?"bg-blue-50 text-blue-700 font-semibold":"text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}>
              <Icon name={item.icon} size={18}/>
              {item.label}
              {item.badge>0 && <span className="absolute right-3 top-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 text-xs font-black">{user?.nome?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{user?.nome}</div>
              <div className="text-xs text-gray-400 truncate">{user?.username}</div>
            </div>
          </div>
          <button onClick={() => setModalSenha(true)}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 mb-1">
            Alterar senha
          </button>
          <button onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 font-medium">
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Icon name="printer" size={16} className="text-white"/>
            </div>
            <div>
              <div className="font-black text-gray-800 text-sm">Almoxarifado</div>
              <div className="text-xs text-gray-400">Gestão de Toners</div>
            </div>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Icon name="menu" size={20} className="text-gray-600"/>
            {alertasCriticos>0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </div>
        {menuOpen && (
          <div className="bg-white border-t border-gray-100 px-3 py-2 space-y-0.5">
            {nav.map(item => (
              <button key={item.id} onClick={() => { setTela(item.id); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative ${tela===item.id?"bg-blue-50 text-blue-700 font-semibold":"text-gray-600 hover:bg-gray-50"}`}>
                <Icon name={item.icon} size={16}/>
                {item.label}
                {item.badge>0 && <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{item.badge}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        <div className="pt-20 lg:pt-0 px-4 py-6 lg:px-8 lg:py-8 max-w-5xl mx-auto">
          {loading
            ? <Spinner/>
            : <>
                {tela==="dashboard"  && <Dashboard  toners={toners} pedidos={pedidos} saidas={saidas}/>}
                {tela==="estoque"    && <Estoque    toners={toners} setToners={setToners} toast={toast}/>}
                {tela==="pedidos"    && <Pedidos    toners={toners} pedidos={pedidos} setPedidos={setPedidos} toast={toast}/>}
                {tela==="entradas"   && <Entrada    toners={toners} setToners={setToners} entradas={entradas} setEntradas={setEntradas} toast={toast}/>}
                {tela==="saidas"     && <Saida      toners={toners} setToners={setToners} saidas={saidas} setSaidas={setSaidas} toast={toast}/>}
                {tela==="relatorios" && <Relatorios saidas={saidas} entradas={entradas}/>} 
                {tela==="historico"  && <Historico />}
                {tela==="usuarios"   && <Usuarios toast={toast} />}
                {tela==="audit"      && <Auditoria />}
              </>
          }
        </div>
      </main>

      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)}/>}
      {modalSenha && <TrocarSenha onClose={() => setModalSenha(false)} toast={toast}/>}
    </div>
  );
}
