import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Componente Badge (extraído de App.jsx para teste) ─────────
const Badge = ({ estoque, minimo }) => {
  if (estoque === 0)
    return <span data-testid="badge">Zerado</span>;
  if (estoque <= minimo)
    return <span data-testid="badge">Crítico</span>;
  return <span data-testid="badge">OK</span>;
};

describe("Badge", () => {
  it("exibe 'Zerado' quando estoque é 0", () => {
    render(<Badge estoque={0} minimo={2} />);
    expect(screen.getByTestId("badge").textContent).toBe("Zerado");
  });

  it("exibe 'Crítico' quando estoque <= mínimo", () => {
    render(<Badge estoque={2} minimo={3} />);
    expect(screen.getByTestId("badge").textContent).toBe("Crítico");
  });

  it("exibe 'OK' quando estoque acima do mínimo", () => {
    render(<Badge estoque={5} minimo={2} />);
    expect(screen.getByTestId("badge").textContent).toBe("OK");
  });
});

// ── Utilitários de data ───────────────────────────────────────
const hoje = () => new Date().toLocaleDateString("pt-BR");
const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();

describe("Utilitários", () => {
  it("hoje() retorna data no formato DD/MM/AAAA", () => {
    expect(hoje()).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("uid() gera string de 7 caracteres maiúsculos", () => {
    const id = uid();
    expect(id).toHaveLength(7);
    expect(id).toBe(id.toUpperCase());
  });
});
