const BASE = "/api";

const getToken = () => localStorage.getItem("token");

const req = async (method, path, body) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:logout"));
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro ao fazer login");
    }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  trocarSenha: (senhaAtual, novaSenha) => req("PUT", "/auth/senha", { senhaAtual, novaSenha }),
  // Toners
  getToners:    ()       => req("GET",    "/toners"),
  createToner:  (data)   => req("POST",   "/toners", data),
  updateToner:  (id, d)  => req("PUT",    `/toners/${id}`, d),
  deleteToner:  (id)     => req("DELETE", `/toners/${id}`),
  // Pedidos
  getPedidos:   ()       => req("GET",    "/pedidos"),
  createPedido: (data)   => req("POST",   "/pedidos", data),
  updatePedido: (id, d)  => req("PUT",    `/pedidos/${id}`, d),
  // Entradas
  getEntradas:  ()       => req("GET",    "/entradas"),
  createEntrada:(data)   => req("POST",   "/entradas", data),
  // Saídas
  getSaidas:    ()       => req("GET",    "/saidas"),
  createSaida:  (data)   => req("POST",   "/saidas", data),
};
