const BASE = "/api";

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const api = {
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
