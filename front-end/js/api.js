async function fetchMovies() {
  try {
    const res = await fetch(`${CONFIG.API_BASE}/movies`);
    if (!res.ok) {
      throw new Error(`Erro ao buscar filmes: HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("fetchMovies:", error);

    if (error instanceof TypeError) {
      throw new Error("Não foi possível conectar ao servidor.");

    }
    throw error;

  }
}

async function fetchMovieById(id) {
  try {
    if (!id) {
      throw new Error("ID do filme não informado.");
    }

    const res = await fetch(`${CONFIG.API_BASE}/movies/${id}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Filme não encontrado.");
      }
      throw new Error(`Erro ao buscar filme: HTTP ${res.status}`);

    }

    return await res.json();

  } catch (error) {
    console.error(`fetchMovieById(${id}):`, error);

    if (error instanceof TypeError) {
      throw new Error("Não foi possível conectar ao servidor.");
    }

    throw error;
  }
}